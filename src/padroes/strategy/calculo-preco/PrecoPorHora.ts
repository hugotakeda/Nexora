import { CalculoPrecoServico } from './CalculoPrecoServico';
import type { ItemOrcamento } from '../../../dominio/Orcamento';

/** Cobra valor/hora × duração estimada × quantidade. */
export class PrecoPorHora implements CalculoPrecoServico {
  public calcular(itens: ItemOrcamento[]): number {
    return itens.reduce((total, i) =>
      total + i.servico.getValorHora() * i.servico.getDuracaoEstimadaHoras() * i.quantidade, 0);
  }

  public descricao(): string { return 'Por hora trabalhada'; }
}
