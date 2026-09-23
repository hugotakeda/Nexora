import { FormaPagamento } from './FormaPagamento';

/** Cartão: até N parcelas sem juros; acima disso, juros compostos ao mês. */
export class PagamentoCartao implements FormaPagamento {
  private static readonly PARCELAS_SEM_JUROS = 3;
  private static readonly JUROS_MES = 0.0299;
  private readonly parcelas: number;

  constructor(parcelas: number) {
    if (parcelas < 1 || parcelas > 12) throw new Error('Parcelas devem estar entre 1 e 12.');
    this.parcelas = parcelas;
  }

  public calcularValorFinal(valor: number): number {
    if (this.parcelas <= PagamentoCartao.PARCELAS_SEM_JUROS) return valor;
    return valor * Math.pow(1 + PagamentoCartao.JUROS_MES, this.parcelas);
  }

  public valorParcela(valor: number): number {
    return this.calcularValorFinal(valor) / this.parcelas;
  }

  public prazoCompensacaoDias(): number { return 30; }
  public nome(): string { return `Cartão ${this.parcelas}x`; }
}
