import { FormaPagamento } from './FormaPagamento';
import { LancamentoFinanceiro } from '../../../dominio/LancamentoFinanceiro';
import { ConexaoBanco } from '../../../nucleo/ConexaoBanco';

/** CONTEXTO do Strategy de pagamento. */
export class ProcessadorCobranca {
  private formaPagamento: FormaPagamento;
  private readonly banco: ConexaoBanco = ConexaoBanco.getInstance();

  constructor(formaPagamento: FormaPagamento) {
    this.formaPagamento = formaPagamento;
  }

  public setFormaPagamento(forma: FormaPagamento): void {
    this.formaPagamento = forma;
  }

  /** Só calcula (para mostrar opções ao cliente), sem registrar. */
  public simular(valor: number): number {
    return this.formaPagamento.calcularValorFinal(valor);
  }

  /** Calcula pela estratégia atual e baixa o lançamento. */
  public async processar(lancamento: LancamentoFinanceiro): Promise<number> {
    const valorFinal = this.formaPagamento.calcularValorFinal(lancamento.getValor());
    lancamento.registrarPagamento(valorFinal, this.formaPagamento.nome());
    await this.banco.executar('UPDATE lancamento_financeiro SET status=?, valor_pago=? WHERE id=?',
      ['PAGO', Number(valorFinal.toFixed(2)), lancamento.getId()]);
    return valorFinal;
  }
}
