import { Orcamento } from './Orcamento';
import { Servico } from './Servico';
import { Coordenada, Tecnico } from './Tecnico';
import { ItemEstoque } from './ItemEstoque';
import { Cliente } from './Cliente';

export type StatusOS = 'ABERTA' | 'AGENDADA' | 'EM_EXECUCAO' | 'CONCLUIDA' | 'CANCELADA';

export interface MaterialUtilizado {
  item: ItemEstoque;
  quantidade: number;
}

/** Ordem de Serviço — núcleo do fluxo Field Service do NEXORA. */
export class OrdemServico {
  private readonly id: string;
  private readonly orcamento: Orcamento;
  private readonly servicoPrincipal: Servico;
  private readonly localAtendimento: Coordenada;
  private tecnico: Tecnico | null;
  private status: StatusOS;
  private readonly materiais: MaterialUtilizado[];
  private readonly checklist: string[];
  private assinaturaCliente: string | null;
  private dataConclusao: Date | null;

  constructor(id: string, orcamento: Orcamento, servicoPrincipal: Servico, localAtendimento: Coordenada) {
    if (orcamento.getStatus() !== 'APROVADO') {
      throw new Error('A OS só pode ser aberta a partir de um orçamento aprovado.');
    }
    this.id = id;
    this.orcamento = orcamento;
    this.servicoPrincipal = servicoPrincipal;
    this.localAtendimento = localAtendimento;
    this.tecnico = null;
    this.status = 'ABERTA';
    this.materiais = [];
    this.checklist = [];
    this.assinaturaCliente = null;
    this.dataConclusao = null;
  }

  public getId(): string { return this.id; }
  public getOrcamento(): Orcamento { return this.orcamento; }
  public getCliente(): Cliente { return this.orcamento.getCliente(); }
  public getServicoPrincipal(): Servico { return this.servicoPrincipal; }
  public getLocalAtendimento(): Coordenada { return this.localAtendimento; }
  public getTecnico(): Tecnico | null { return this.tecnico; }
  public getStatus(): StatusOS { return this.status; }
  public getMateriais(): MaterialUtilizado[] { return [...this.materiais]; }
  public getChecklist(): string[] { return [...this.checklist]; }
  public getAssinaturaCliente(): string | null { return this.assinaturaCliente; }
  public getDataConclusao(): Date | null { return this.dataConclusao; }
  public getValorOrcado(): number { return this.orcamento.calcularTotal(); }

  public custoMateriais(): number {
    return this.materiais.reduce((s, m) => s + m.item.getCustoUnitario() * m.quantidade, 0);
  }

  public atribuirTecnico(tecnico: Tecnico): void {
    if (this.tecnico) throw new Error(`OS ${this.id} já possui técnico.`);
    tecnico.atribuirOS();
    this.tecnico = tecnico;
  }

  public marcarAgendada(): void { this.transicionar(['ABERTA'], 'AGENDADA'); }

  public iniciarExecucao(): void {
    if (!this.tecnico) throw new Error('Não é possível iniciar OS sem técnico.');
    this.transicionar(['AGENDADA'], 'EM_EXECUCAO');
  }

  public registrarMaterial(item: ItemEstoque, quantidade: number): void {
    if (this.status !== 'EM_EXECUCAO') throw new Error('Materiais só podem ser lançados durante a execução.');
    this.materiais.push({ item, quantidade });
  }

  public adicionarChecklist(descricao: string): void { this.checklist.push(descricao); }
  public registrarAssinatura(nome: string): void { this.assinaturaCliente = nome; }

  public concluir(): void {
    this.transicionar(['EM_EXECUCAO'], 'CONCLUIDA');
    this.dataConclusao = new Date();
    this.tecnico?.liberarOS();
  }

  public cancelar(): void {
    this.transicionar(['ABERTA', 'AGENDADA'], 'CANCELADA');
    this.tecnico?.liberarOS();
  }

  private transicionar(permitidos: StatusOS[], novo: StatusOS): void {
    if (!permitidos.includes(this.status)) {
      throw new Error(`OS ${this.id}: transição ${this.status} -> ${novo} inválida.`);
    }
    this.status = novo;
  }
}
