/** Técnico de campo que executa as Ordens de Serviço. */
export interface Coordenada {
  latitude: number;
  longitude: number;
}

export class Tecnico {
  private readonly id: string;
  private nome: string;
  private especialidades: string[];
  private localizacao: Coordenada;
  private ordensEmAberto: number;
  private readonly capacidadeMaxima: number;
  private disponivel: boolean;

  constructor(id: string, nome: string, especialidades: string[],
              localizacao: Coordenada, capacidadeMaxima = 3) {
    this.id = id;
    this.nome = nome;
    this.especialidades = especialidades;
    this.localizacao = localizacao;
    this.capacidadeMaxima = capacidadeMaxima;
    this.ordensEmAberto = 0;
    this.disponivel = true;
  }

  public getId(): string { return this.id; }
  public getNome(): string { return this.nome; }
  public getEspecialidades(): string[] { return [...this.especialidades]; }
  public getLocalizacao(): Coordenada { return this.localizacao; }
  public getOrdensEmAberto(): number { return this.ordensEmAberto; }
  public estaDisponivel(): boolean { return this.disponivel; }

  public possuiEspecialidade(especialidade: string): boolean {
    return this.especialidades.includes(especialidade);
  }

  public temCapacidade(): boolean {
    return this.disponivel && this.ordensEmAberto < this.capacidadeMaxima;
  }

  public atribuirOS(): void {
    if (!this.temCapacidade()) {
      throw new Error(`Técnico ${this.nome} sem capacidade para nova OS.`);
    }
    this.ordensEmAberto++;
  }

  public liberarOS(): void {
    if (this.ordensEmAberto > 0) this.ordensEmAberto--;
  }

  public definirDisponibilidade(disponivel: boolean): void { this.disponivel = disponivel; }
  public atualizarLocalizacao(nova: Coordenada): void { this.localizacao = nova; }

  /** Distância em km (fórmula de Haversine). */
  public distanciaAte(destino: Coordenada): number {
    const R = 6371;
    const rad = (g: number) => (g * Math.PI) / 180;
    const dLat = rad(destino.latitude - this.localizacao.latitude);
    const dLon = rad(destino.longitude - this.localizacao.longitude);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(rad(this.localizacao.latitude)) * Math.cos(rad(destino.latitude)) *
      Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }
}
