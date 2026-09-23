import { ConexaoBanco, Parametro } from '../../../nucleo/ConexaoBanco';

export interface ResultadoImportacao<T> {
  importados: T[];
  erros: string[];
}

/**
 * TEMPLATE METHOD — Exemplo 3: Importação de dados (onboarding de novos tenants).
 *
 * Fluxo fixo: pular cabeçalho → separar campos → validar → converter
 * → persistir → exibir resumo. Cada importador define só as regras do seu dado.
 */
export abstract class ImportadorDados<T> {
  protected readonly banco: ConexaoBanco = ConexaoBanco.getInstance();

  /** MÉTODO TEMPLATE. */
  public async importar(conteudo: string[]): Promise<ResultadoImportacao<T>> {
    const resultado: ResultadoImportacao<T> = { importados: [], erros: [] };
    const deslocamento = this.possuiCabecalho() ? 1 : 0;   // hook

    const linhas = conteudo.slice(deslocamento);
    for (let i = 0; i < linhas.length; i++) {
      const numeroLinha = i + 1 + deslocamento;
      const campos = this.separarCampos(linhas[i]);
      const erro = this.validar(campos);
      if (erro) {
        resultado.erros.push(`Linha ${numeroLinha}: ${erro}`);
        continue;
      }
      const objeto = this.converter(campos);
      await this.persistir(objeto);
      resultado.importados.push(objeto);
    }

    this.exibirResumo(resultado);
    return resultado;
  }

  // Passos comuns
  protected separarCampos(linha: string): string[] {
    return linha.split(this.separador()).map((c) => c.trim());
  }

  protected async persistir(objeto: T): Promise<void> {
    const params = this.parametrosPersistencia(objeto);
    const marcadores = params.map(() => '?').join(',');
    await this.banco.executar(`INSERT INTO ${this.tabelaDestino()} VALUES (${marcadores})`, params);
  }

  protected exibirResumo(r: ResultadoImportacao<T>): void {
    console.log(`   ${this.nomeImportador()}: ${r.importados.length} importado(s), ${r.erros.length} erro(s)`);
    r.erros.forEach((e) => console.log(`     ! ${e}`));
  }

  // Passos abstratos
  protected abstract nomeImportador(): string;
  protected abstract tabelaDestino(): string;
  protected abstract validar(campos: string[]): string | null;
  protected abstract converter(campos: string[]): T;
  protected abstract parametrosPersistencia(objeto: T): Parametro[];

  // Hooks
  protected separador(): string { return ';'; }
  protected possuiCabecalho(): boolean { return true; }
}
