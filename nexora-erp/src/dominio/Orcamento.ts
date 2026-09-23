import { Cliente } from './Cliente';
import { Servico } from './Servico';
import type { CalculoPrecoServico } from '../padroes/strategy/calculo-preco/CalculoPrecoServico';

export type StatusOrcamento = 'RASCUNHO' | 'ENVIADO' | 'APROVADO' | 'REPROVADO';

export interface ItemOrcamento {
  servico: Servico;
  quantidade: number;
}

/**
 * Orçamento enviado ao cliente.
 * É o CONTEXTO do Strategy "CalculoPrecoServico".
 */
export class Orcamento {
  private readonly id: string;
  private readonly cliente: Cliente;
  private readonly itens: ItemOrcamento[];
  private status: StatusOrcamento;
  private estrategiaPreco: CalculoPrecoServico;
  private readonly dataCriacao: Date;
  private readonly validadeDias: number;

  constructor(id: string, cliente: Cliente, estrategiaPreco: CalculoPrecoServico, validadeDias = 15) {
    this.id = id;
    this.cliente = cliente;
    this.estrategiaPreco = estrategiaPreco;
    this.validadeDias = validadeDias;
    this.itens = [];
    this.status = 'RASCUNHO';
    this.dataCriacao = new Date();
  }

  public getId(): string { return this.id; }
  public getCliente(): Cliente { return this.cliente; }
  public getStatus(): StatusOrcamento { return this.status; }
  public getItens(): ItemOrcamento[] { return [...this.itens]; }
  public getEstrategiaPreco(): CalculoPrecoServico { return this.estrategiaPreco; }

  /** Troca o algoritmo de cálculo em tempo de execução. */
  public setEstrategiaPreco(estrategia: CalculoPrecoServico): void {
    this.estrategiaPreco = estrategia;
  }

  public adicionarItem(servico: Servico, quantidade: number): void {
    if (this.status !== 'RASCUNHO') throw new Error('Só é possível alterar orçamentos em rascunho.');
    if (quantidade <= 0) throw new Error('Quantidade deve ser positiva.');
    this.itens.push({ servico, quantidade });
  }

  /** Delega o cálculo para a estratégia atual. */
  public calcularTotal(): number {
    return this.estrategiaPreco.calcular(this.itens);
  }

  public estaVencido(referencia: Date = new Date()): boolean {
    const limite = new Date(this.dataCriacao);
    limite.setDate(limite.getDate() + this.validadeDias);
    return referencia > limite;
  }

  public enviar(): void {
    if (this.itens.length === 0) throw new Error('Orçamento sem itens.');
    this.transicionar(['RASCUNHO'], 'ENVIADO');
  }

  public aprovar(): void { this.transicionar(['ENVIADO'], 'APROVADO'); }
  public reprovar(): void { this.transicionar(['ENVIADO'], 'REPROVADO'); }

  private transicionar(permitidos: StatusOrcamento[], novo: StatusOrcamento): void {
    if (!permitidos.includes(this.status)) {
      throw new Error(`Orçamento ${this.id}: transição ${this.status} -> ${novo} inválida.`);
    }
    this.status = novo;
  }
}
