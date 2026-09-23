import { FormaPagamento } from './FormaPagamento';

/** Pix: desconto à vista e compensação imediata. */
export class PagamentoPix implements FormaPagamento {
  private readonly percentualDesconto: number;

  constructor(percentualDesconto = 5) {
    this.percentualDesconto = percentualDesconto;
  }

  public calcularValorFinal(valor: number): number {
    return valor * (1 - this.percentualDesconto / 100);
  }

  public prazoCompensacaoDias(): number { return 0; }
  public nome(): string { return `Pix (-${this.percentualDesconto}%)`; }
}
