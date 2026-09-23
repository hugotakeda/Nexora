import { FormaPagamento } from './FormaPagamento';

/** Boleto: tarifa bancária fixa repassada ao cliente. */
export class PagamentoBoleto implements FormaPagamento {
  private readonly tarifa: number;

  constructor(tarifa = 3.49) {
    this.tarifa = tarifa;
  }

  public calcularValorFinal(valor: number): number { return valor + this.tarifa; }
  public prazoCompensacaoDias(): number { return 3; }
  public nome(): string { return `Boleto (+R$ ${this.tarifa.toFixed(2)})`; }
}
