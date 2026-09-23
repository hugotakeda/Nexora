import { GeradorRelatorio } from './GeradorRelatorio';
import { LancamentoFinanceiro } from '../../../dominio/LancamentoFinanceiro';
import { moeda } from '../../../util/formatacao';

/** Relatório financeiro ordenado por vencimento, COM totalizador (hook ligado). */
export class RelatorioFinanceiro extends GeradorRelatorio<LancamentoFinanceiro> {
  private readonly lancamentos: LancamentoFinanceiro[];

  constructor(lancamentos: LancamentoFinanceiro[]) {
    super();
    this.lancamentos = lancamentos;
  }

  protected titulo(): string { return 'Fluxo Financeiro'; }

  protected coletarDados(): LancamentoFinanceiro[] {
    return [...this.lancamentos]
      .filter((l) => l.getStatus() !== 'CANCELADO')
      .sort((a, b) => a.getVencimento().getTime() - b.getVencimento().getTime());
  }

  protected formatarLinha(l: LancamentoFinanceiro): string {
    const sinal = l.getTipo() === 'RECEITA' ? '+' : '-';
    return `${l.getId()} | ${l.getDescricao()} | ${sinal}${moeda(l.getValor())} | ` +
      `vence ${l.getVencimento().toLocaleDateString('pt-BR')} | ${l.getStatus()}`;
  }

  protected incluirTotalizador(): boolean { return true; }

  protected montarTotalizador(dados: LancamentoFinanceiro[]): string {
    const soma = (tipo: string) => dados
      .filter((l) => l.getTipo() === tipo)
      .reduce((s, l) => s + l.getValor(), 0);
    const receitas = soma('RECEITA');
    const despesas = soma('DESPESA');
    return `  Receitas: ${moeda(receitas)} | Despesas: ${moeda(despesas)} | Saldo: ${moeda(receitas - despesas)}`;
  }
}
