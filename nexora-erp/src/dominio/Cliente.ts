/** Cliente atendido por uma empresa (tenant) do NEXORA. */
export class Cliente {
  private readonly id: string;
  private readonly empresaId: string;
  private nome: string;
  private readonly documento: string;
  private email: string;
  private telefone: string;
  private endereco: string;

  constructor(id: string, empresaId: string, nome: string, documento: string,
              email: string, telefone: string, endereco: string) {
    this.id = id;
    this.empresaId = empresaId;
    this.nome = nome;
    this.documento = documento;
    this.email = email;
    this.telefone = telefone;
    this.endereco = endereco;
  }

  public getId(): string { return this.id; }
  public getEmpresaId(): string { return this.empresaId; }
  public getNome(): string { return this.nome; }
  public getDocumento(): string { return this.documento; }
  public getEmail(): string { return this.email; }
  public getTelefone(): string { return this.telefone; }
  public getEndereco(): string { return this.endereco; }

  public atualizarContato(email: string, telefone: string): void {
    this.email = email;
    this.telefone = telefone;
  }

  public atualizarEndereco(endereco: string): void { this.endereco = endereco; }

  /** CPF (11 dígitos) ou CNPJ (14 dígitos). */
  public documentoValido(): boolean {
    const digitos = this.documento.replace(/\D/g, '');
    return digitos.length === 11 || digitos.length === 14;
  }

  public resumo(): string {
    return `${this.nome} <${this.email}>`;
  }
}
