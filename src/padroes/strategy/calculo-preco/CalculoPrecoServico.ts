import type { ItemOrcamento } from '../../../dominio/Orcamento';

/**
 * STRATEGY — Exemplo 1: Cálculo de preço do orçamento.
 * Contexto: Orcamento. Cada empresa (ou cada cliente) pode cobrar de um jeito.
 */
export interface CalculoPrecoServico {
  calcular(itens: ItemOrcamento[]): number;
  descricao(): string;
}
