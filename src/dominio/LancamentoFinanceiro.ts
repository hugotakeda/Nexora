export type TipoLancamento = 'RECEITA' | 'DESPESA';
export type StatusLancamento = 'PENDENTE' | 'PAGO' | 'CANCELADO';

/** Lançamento de contas a receber / a pagar. */
export class LancamentoFinanceiro {
  private readonly id: string;
  private readonly tipo: TipoLancamento;
  private readonly descricao: string;
  private readonly valor: number;
  private readonly vencimento: Date;
  private status: StatusLancamento;
  private valorPago: number | null;
  private formaPagamento: string | null;
  private dataPagamento: Date | null;

  constructor(id: string, tipo: TipoLancamento, descricao: string, valor: number, vencimento: Date) {
    if (valor <= 0) throw new Error('Valor do lançamento deve ser positivo.');
    this.id = id;
    this.tipo = tipo;
    this.descricao = descricao;
    this.valor = valor;
    this.vencimento = vencimento;
    this.status = 'PENDENTE';
    this.valorPago = null;
    this.formaPagamento = null;
    this.dataPagamento = null;
  }

  public getId(): string { return this.id; }
  public getTipo(): TipoLancamento { return this.tipo; }
  public getDescricao(): string { return this.descricao; }
  public getValor(): number { return this.valor; }
  public getVencimento(): Date { return this.vencimento; }
  public getStatus(): StatusLancamento { return this.status; }
  public getValorPago(): number | null { return this.valorPago; }
  public getFormaPagamento(): string | null { return this.formaPagamento; }
  public getDataPagamento(): Date | null { return this.dataPagamento; }

  public registrarPagamento(valorPago: number, formaPagamento: string): void {
    if (this.status !== 'PENDENTE') throw new Error(`Lançamento ${this.id} não está pendente.`);
    this.valorPago = valorPago;
    this.formaPagamento = formaPagamento;
    this.dataPagamento = new Date();
    this.status = 'PAGO';
  }

  public cancelar(): void {
    if (this.status === 'PAGO') throw new Error('Lançamento pago não pode ser cancelado.');
    this.status = 'CANCELADO';
  }

  public estaVencido(referencia: Date = new Date()): boolean {
    return this.status === 'PENDENTE' && referencia > this.vencimento;
  }
}
