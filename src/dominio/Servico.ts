/** Serviço do catálogo da empresa (ex.: instalação de ar-condicionado). */
export class Servico {
  private readonly id: string;
  private descricao: string;
  private readonly categoria: string; // especialidade exigida do técnico
  private precoBase: number;
  private valorHora: number;
  private duracaoEstimadaHoras: number;

  constructor(id: string, descricao: string, categoria: string,
              precoBase: number, valorHora: number, duracaoEstimadaHoras: number) {
    this.id = id;
    this.descricao = descricao;
    this.categoria = categoria;
    this.precoBase = precoBase;
    this.valorHora = valorHora;
    this.duracaoEstimadaHoras = duracaoEstimadaHoras;
  }

  public getId(): string { return this.id; }
  public getDescricao(): string { return this.descricao; }
  public getCategoria(): string { return this.categoria; }
  public getPrecoBase(): number { return this.precoBase; }
  public getValorHora(): number { return this.valorHora; }
  public getDuracaoEstimadaHoras(): number { return this.duracaoEstimadaHoras; }

  public reajustarPreco(percentual: number): void {
    this.precoBase *= 1 + percentual / 100;
    this.valorHora *= 1 + percentual / 100;
  }

  public alterarDuracao(horas: number): void {
    if (horas <= 0) throw new Error('Duração deve ser positiva.');
    this.duracaoEstimadaHoras = horas;
  }
}
