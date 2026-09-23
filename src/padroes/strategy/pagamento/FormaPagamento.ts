/**
 * STRATEGY — Exemplo 3: Forma de pagamento da cobrança.
 * Contexto: ProcessadorCobranca.
 */
export interface FormaPagamento {
  calcularValorFinal(valor: number): number;
  prazoCompensacaoDias(): number;
  nome(): string;
}
