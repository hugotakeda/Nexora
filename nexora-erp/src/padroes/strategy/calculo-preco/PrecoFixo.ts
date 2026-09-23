import { CalculoPrecoServico } from './CalculoPrecoServico';
import type { ItemOrcamento } from '../../../dominio/Orcamento';

/** Cobra o preço de tabela do serviço, com desconto opcional por volume. */
export class PrecoFixo implements CalculoPrecoServico {
  private readonly quantidadeParaDesconto: number;
  private readonly percentualDesconto: number;

  constructor(quantidadeParaDesconto = 3, percentualDesconto = 10) {
    this.quantidadeParaDesconto = quantidadeParaDesconto;
    this.percentualDesconto = percentualDesconto;
  }

  public calcular(itens: ItemOrcamento[]): number {
    const bruto = itens.reduce((t, i) => t + i.servico.getPrecoBase() * i.quantidade, 0);
    const volume = itens.reduce((t, i) => t + i.quantidade, 0);
    return volume >= this.quantidadeParaDesconto
      ? bruto * (1 - this.percentualDesconto / 100)
      : bruto;
  }

  public descricao(): string {
    return `Preço fixo de tabela (${this.percentualDesconto}% off a partir de ${this.quantidadeParaDesconto} un.)`;
  }
}
