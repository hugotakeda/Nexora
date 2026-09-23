/**
 * Empresa (tenant) do SaaS NEXORA.
 * Cada empresa contrata um produto derivado da Linha de Produto (LPS).
 */
export type LinhaProduto = 'CORE' | 'TECH' | 'MAINT' | 'FIELD';

export class Empresa {
  private readonly id: string;
  private razaoSocial: string;
  private readonly cnpj: string;
  private linhaProduto: LinhaProduto;
  private ativa: boolean;

  constructor(id: string, razaoSocial: string, cnpj: string, linhaProduto: LinhaProduto) {
    this.id = id;
    this.razaoSocial = razaoSocial;
    this.cnpj = cnpj;
    this.linhaProduto = linhaProduto;
    this.ativa = true;
  }

  public getId(): string { return this.id; }
  public getRazaoSocial(): string { return this.razaoSocial; }
  public getCnpj(): string { return this.cnpj; }
  public getLinhaProduto(): LinhaProduto { return this.linhaProduto; }
  public estaAtiva(): boolean { return this.ativa; }

  public alterarRazaoSocial(novaRazao: string): void { this.razaoSocial = novaRazao; }
  public alterarLinhaProduto(linha: LinhaProduto): void { this.linhaProduto = linha; }
  public ativar(): void { this.ativa = true; }
  public desativar(): void { this.ativa = false; }

  public toString(): string {
    return `${this.razaoSocial} (CNPJ ${this.cnpj}) — NEXORA ${this.linhaProduto}`;
  }
}
