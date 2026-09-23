import { RowDataPacket } from 'mysql2/promise';
import { ConexaoBanco } from './ConexaoBanco';
import { CampoModulo, ModuloCrud, Registro } from './tipos';

/**
 * CORE ASSET — repositório genérico de CRUD.
 *
 * Monta o SQL a partir da descrição do módulo, então os oito módulos do
 * projeto compartilham este mesmo código de acesso a dados. Todo comando usa
 * parâmetros (?) do MySQL, o que evita SQL injection.
 */
export class RepositorioBase {
  private readonly banco: ConexaoBanco = ConexaoBanco.getInstance();
  protected readonly modulo: ModuloCrud;

  constructor(modulo: ModuloCrud) {
    this.modulo = modulo;
  }

  private get colunas(): string[] {
    return this.modulo.campos.map((c) => c.nome);
  }

  /** READ — lista com busca opcional. */
  public async listar(empresaId: string, busca = ''): Promise<Registro[]> {
    const condicoes: string[] = [];
    const params: (string | number)[] = [];

    if (this.modulo.porEmpresa) {
      condicoes.push('empresa_id = ?');
      params.push(empresaId);
    }
    if (busca && this.modulo.buscarEm.length > 0) {
      const like = this.modulo.buscarEm.map((c) => `${c} LIKE ?`).join(' OR ');
      condicoes.push(`(${like})`);
      this.modulo.buscarEm.forEach(() => params.push(`%${busca}%`));
    }
    const onde = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';
    const sql = `SELECT id, ${this.colunas.join(', ')} FROM ${this.modulo.tabela} ${onde} ORDER BY ${this.modulo.ordenarPor}`;
    return this.banco.consultar<RowDataPacket & Registro>(sql, params);
  }

  /**
   * Filtro de isolamento multiempresa: toda leitura, alteração e exclusão por id
   * também confere a empresa, então uma empresa nunca enxerga nem altera o
   * registro de outra, mesmo que alguém digite o id de outra empresa na URL.
   */
  private filtroId(id: string, empresaId?: string): { onde: string; params: string[] } {
    return this.modulo.porEmpresa && empresaId
      ? { onde: 'WHERE id = ? AND empresa_id = ?', params: [id, empresaId] }
      : { onde: 'WHERE id = ?', params: [id] };
  }

  /** READ — um registro. */
  public async buscarPorId(id: string, empresaId?: string): Promise<Registro | null> {
    const { onde, params } = this.filtroId(id, empresaId);
    const linhas = await this.banco.consultar<RowDataPacket & Registro>(
      `SELECT id, ${this.colunas.join(', ')} FROM ${this.modulo.tabela} ${onde}`, params);
    return linhas[0] ?? null;
  }

  /** CREATE */
  public async criar(id: string, empresaId: string, dados: Registro): Promise<Registro> {
    const colunas = ['id', ...(this.modulo.porEmpresa ? ['empresa_id'] : []), ...this.colunas];
    const valores = [id, ...(this.modulo.porEmpresa ? [empresaId] : []),
      ...this.modulo.campos.map((c) => this.normalizar(c, dados[c.nome]))];
    await this.banco.executar(
      `INSERT INTO ${this.modulo.tabela} (${colunas.join(', ')}) VALUES (${colunas.map(() => '?').join(', ')})`,
      valores);
    return (await this.buscarPorId(id, empresaId))!;
  }

  /** UPDATE */
  public async atualizar(id: string, empresaId: string, dados: Registro): Promise<Registro | null> {
    const atribuicoes = this.colunas.map((c) => `${c} = ?`).join(', ');
    const { onde, params } = this.filtroId(id, empresaId);
    const valores = [...this.modulo.campos.map((c) => this.normalizar(c, dados[c.nome])), ...params];
    const r = await this.banco.executar(`UPDATE ${this.modulo.tabela} SET ${atribuicoes} ${onde}`, valores);
    return r.affectedRows > 0 ? this.buscarPorId(id, empresaId) : null;
  }

  /** DELETE */
  public async excluir(id: string, empresaId: string): Promise<boolean> {
    const { onde, params } = this.filtroId(id, empresaId);
    const r = await this.banco.executar(`DELETE FROM ${this.modulo.tabela} ${onde}`, params);
    return r.affectedRows > 0;
  }

  /** Opções para os campos de referência (chaves estrangeiras) de outras telas. */
  public async opcoes(empresaId: string, colunaRotulo: string): Promise<{ id: string; rotulo: string }[]> {
    const onde = this.modulo.porEmpresa ? 'WHERE empresa_id = ?' : '';
    const linhas = await this.banco.consultar<RowDataPacket & { id: string; rotulo: string }>(
      `SELECT id, ${colunaRotulo} AS rotulo FROM ${this.modulo.tabela} ${onde} ORDER BY ${colunaRotulo}`,
      this.modulo.porEmpresa ? [empresaId] : []);
    return linhas.map((l) => ({ id: l.id, rotulo: String(l.rotulo) }));
  }

  /** Gera o próximo id no formato PREFIXO-0001. */
  public async proximoId(): Promise<string> {
    const linhas = await this.banco.consultar<RowDataPacket & { total: number }>(
      `SELECT COUNT(*) AS total FROM ${this.modulo.tabela}`);
    const sequencia = Number(linhas[0]?.total ?? 0) + 1;
    const candidato = `${this.modulo.prefixoId}-${String(sequencia).padStart(4, '0')}`;
    return (await this.buscarPorId(candidato)) ? `${this.modulo.prefixoId}-${Date.now().toString().slice(-6)}` : candidato;
  }

  /** Converte o valor recebido da tela para o formato que o MySQL espera. */
  private normalizar(campo: CampoModulo, valor: unknown): string | number | null {
    if (valor === undefined || valor === null || valor === '') return null;
    if (typeof valor === 'boolean') return valor ? 1 : 0;

    if (campo.tipo === 'data') return this.formatarData(valor).slice(0, 10);
    if (campo.tipo === 'datahora') return this.formatarData(valor);
    if (campo.tipo === 'booleano') return ['1', 'true', 'sim'].includes(String(valor).toLowerCase()) ? 1 : 0;
    if (campo.tipo === 'numero' || campo.tipo === 'moeda') return Number(valor);
    return String(valor);
  }

  /** Aceita 'YYYY-MM-DD HH:MM:SS', ISO ou Date e devolve o formato do MySQL. */
  private formatarData(valor: unknown): string {
    const texto = String(valor);
    if (/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$/.test(texto)) {
      return texto.length === 10 ? `${texto} 00:00:00` : texto;
    }
    const d = valor instanceof Date ? valor : new Date(texto);
    if (Number.isNaN(d.getTime())) return texto;
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  }
}
