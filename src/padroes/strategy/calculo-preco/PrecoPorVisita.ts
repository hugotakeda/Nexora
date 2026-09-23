import { CalculoPrecoServico } from './CalculoPrecoServico';
import type { ItemOrcamento } from '../../../dominio/Orcamento';

/** Taxa de deslocamento por visita + preço de tabela dos serviços. */
export class PrecoPorVisita implements CalculoPrecoServico {
  private readonly taxaVisita: number;

  constructor(taxaVisita: number) {
    this.taxaVisita = taxaVisita;
  }

  public calcular(itens: ItemOrcamento[]): number {
    const servicos = itens.reduce((t, i) => t + i.servico.getPrecoBase() * i.quantidade, 0);
    return this.taxaVisita + servicos;
  }

  public descricao(): string { return `Taxa de visita (R$ ${this.taxaVisita.toFixed(2)}) + tabela`; }
}
