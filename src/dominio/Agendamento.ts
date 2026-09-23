import { OrdemServico } from './OrdemServico';
import { Tecnico } from './Tecnico';

/** Agendamento de uma OS na agenda do técnico. */
export class Agendamento {
  private readonly id: string;
  private readonly ordem: OrdemServico;
  private readonly tecnico: Tecnico;
  private inicio: Date;
  private duracaoHoras: number;
  private confirmado: boolean;

  constructor(id: string, ordem: OrdemServico, tecnico: Tecnico, inicio: Date, duracaoHoras: number) {
    this.id = id;
    this.ordem = ordem;
    this.tecnico = tecnico;
    this.inicio = inicio;
    this.duracaoHoras = duracaoHoras;
    this.confirmado = false;
  }

  public getId(): string { return this.id; }
  public getOrdem(): OrdemServico { return this.ordem; }
  public getTecnico(): Tecnico { return this.tecnico; }
  public getInicio(): Date { return this.inicio; }
  public estaConfirmado(): boolean { return this.confirmado; }

  public getFim(): Date {
    return new Date(this.inicio.getTime() + this.duracaoHoras * 3_600_000);
  }

  /** Dois agendamentos conflitam se são do mesmo técnico e os horários se sobrepõem. */
  public conflitaCom(outro: Agendamento): boolean {
    if (this.tecnico.getId() !== outro.tecnico.getId()) return false;
    return this.inicio < outro.getFim() && outro.inicio < this.getFim();
  }

  public confirmar(): void {
    if (this.confirmado) return;
    this.ordem.marcarAgendada();
    this.confirmado = true;
  }

  public reagendar(novoInicio: Date, novaDuracao?: number): void {
    this.inicio = novoInicio;
    if (novaDuracao !== undefined) this.duracaoHoras = novaDuracao;
  }
}
