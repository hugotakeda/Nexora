/** Item (peça/material) controlado no estoque. */
export class ItemEstoque {
  private readonly id: string;
  private readonly sku: string;
  private descricao: string;
  private quantidade: number;
  private estoqueMinimo: number;
  private custoUnitario: number;

  constructor(id: string, sku: string, descricao: string,
              quantidade: number, estoqueMinimo: number, custoUnitario: number) {
    this.id = id;
    this.sku = sku;
    this.descricao = descricao;
    this.quantidade = quantidade;
    this.estoqueMinimo = estoqueMinimo;
    this.custoUnitario = custoUnitario;
  }

  public getId(): string { return this.id; }
  public getSku(): string { return this.sku; }
  public getDescricao(): string { return this.descricao; }
  public getQuantidade(): number { return this.quantidade; }
  public getEstoqueMinimo(): number { return this.estoqueMinimo; }
  public getCustoUnitario(): number { return this.custoUnitario; }

  public entrada(qtd: number): void {
    if (qtd <= 0) throw new Error('Quantidade de entrada inválida.');
    this.quantidade += qtd;
  }

  public saida(qtd: number): void {
    if (qtd <= 0) throw new Error('Quantidade de saída inválida.');
    if (qtd > this.quantidade) {
      throw new Error(`Estoque insuficiente de ${this.sku}: disponível ${this.quantidade}, solicitado ${qtd}.`);
    }
    this.quantidade -= qtd;
  }

  public abaixoDoMinimo(): boolean { return this.quantidade < this.estoqueMinimo; }
  public valorEmEstoque(): number { return this.quantidade * this.custoUnitario; }
  public atualizarCusto(novoCusto: number): void { this.custoUnitario = novoCusto; }
  public definirEstoqueMinimo(minimo: number): void { this.estoqueMinimo = minimo; }
}
