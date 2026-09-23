import { ItemEstoque } from './ItemEstoque';

export type TipoMovimentacao = 'ENTRADA' | 'SAIDA';

/** Registro de entrada/saída de um item de estoque (rastreabilidade). */
export class MovimentacaoEstoque {
  private static sequencia = 0;

  private readonly id: string;
  private readonly item: ItemEstoque;
  private readonly tipo: TipoMovimentacao;
  private readonly quantidade: number;
  private readonly motivo: string;
  private readonly data: Date;
  private aplicada: boolean;

  constructor(item: ItemEstoque, tipo: TipoMovimentacao, quantidade: number, motivo: string) {
    this.id = `MOV-${++MovimentacaoEstoque.sequencia}`;
    this.item = item;
    this.tipo = tipo;
    this.quantidade = quantidade;
    this.motivo = motivo;
    this.data = new Date();
    this.aplicada = false;
  }

  public getId(): string { return this.id; }
  public getItem(): ItemEstoque { return this.item; }
  public getTipo(): TipoMovimentacao { return this.tipo; }
  public getQuantidade(): number { return this.quantidade; }
  public getMotivo(): string { return this.motivo; }
  public getData(): Date { return this.data; }
  public foiAplicada(): boolean { return this.aplicada; }

  /** Efetiva a movimentação no saldo do item (uma única vez). */
  public aplicar(): void {
    if (this.aplicada) throw new Error(`${this.id} já foi aplicada.`);
    if (this.tipo === 'ENTRADA') this.item.entrada(this.quantidade);
    else this.item.saida(this.quantidade);
    this.aplicada = true;
  }

  public descricao(): string {
    const sinal = this.tipo === 'ENTRADA' ? '+' : '-';
    return `${this.id} ${this.item.getSku()} ${sinal}${this.quantidade} (${this.motivo})`;
  }
}
