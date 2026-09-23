import { ConexaoBanco } from './ConexaoBanco';
import { RowDataPacket } from 'mysql2/promise';

export type NomeLinhaProduto = 'CORE' | 'TECH' | 'MAINT' | 'FIELD';

/**
 * MODELO DE VARIABILIDADE da Linha de Produto NEXORA.
 *
 * `OBRIGATORIAS` são as features do núcleo: todo produto derivado as tem.
 * `OPCIONAIS` variam de produto para produto — é o ponto de variação.
 * A empresa (tenant) pode ainda ligar ou desligar features individualmente,
 * e essa escolha fica gravada na tabela `empresa_feature`.
 */
export const FEATURES_OBRIGATORIAS = ['clientes', 'servicos', 'ordens-servico', 'financeiro'];

export const FEATURES_OPCIONAIS = ['orcamentos', 'tecnicos', 'agenda', 'estoque'];

export const PRODUTOS: Record<NomeLinhaProduto, { nome: string; publico: string; opcionais: string[] }> = {
  CORE:  { nome: 'NEXORA Core',  publico: 'Prestador enxuto, sem equipe de campo própria', opcionais: [] },
  TECH:  { nome: 'NEXORA Tech',  publico: 'Assistência técnica com bancada e peças',       opcionais: ['orcamentos', 'estoque'] },
  MAINT: { nome: 'NEXORA Maint', publico: 'Contratos de manutenção preventiva',            opcionais: ['tecnicos', 'agenda'] },
  FIELD: { nome: 'NEXORA Field', publico: 'Operação completa de campo',                    opcionais: ['orcamentos', 'tecnicos', 'agenda', 'estoque'] },
};

interface LinhaEmpresa extends RowDataPacket { linha_produto: NomeLinhaProduto }
interface LinhaFeature extends RowDataPacket { feature: string; habilitada: number }

/** Resolve, em tempo de execução, quais features valem para uma empresa. */
export class ResolvedorVariabilidade {
  private readonly banco = ConexaoBanco.getInstance();

  public async linhaDaEmpresa(empresaId: string): Promise<NomeLinhaProduto> {
    const linhas = await this.banco.consultar<LinhaEmpresa>(
      'SELECT linha_produto FROM empresa WHERE id = ?', [empresaId]);
    return linhas[0]?.linha_produto ?? 'CORE';
  }

  /** Features do produto + ajustes individuais gravados para a empresa. */
  public async featuresAtivas(empresaId: string): Promise<string[]> {
    const linha = await this.linhaDaEmpresa(empresaId);
    const ativas = new Set([...FEATURES_OBRIGATORIAS, ...PRODUTOS[linha].opcionais]);

    const ajustes = await this.banco.consultar<LinhaFeature>(
      'SELECT feature, habilitada FROM empresa_feature WHERE empresa_id = ?', [empresaId]);
    for (const ajuste of ajustes) {
      if (FEATURES_OBRIGATORIAS.includes(ajuste.feature)) continue; // núcleo não pode ser desligado
      if (ajuste.habilitada) ativas.add(ajuste.feature);
      else ativas.delete(ajuste.feature);
    }
    return [...ativas];
  }

  public async trocarLinhaProduto(empresaId: string, linha: NomeLinhaProduto): Promise<void> {
    await this.banco.executar('UPDATE empresa SET linha_produto = ? WHERE id = ?', [linha, empresaId]);
    await this.banco.executar('DELETE FROM empresa_feature WHERE empresa_id = ?', [empresaId]);
  }

  public async definirFeature(empresaId: string, feature: string, habilitada: boolean): Promise<void> {
    if (FEATURES_OBRIGATORIAS.includes(feature)) {
      throw new Error(`A feature "${feature}" faz parte do núcleo e não pode ser desligada.`);
    }
    await this.banco.executar(
      `INSERT INTO empresa_feature (empresa_id, feature, habilitada) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE habilitada = VALUES(habilitada)`,
      [empresaId, feature, habilitada ? 1 : 0]);
  }
}
