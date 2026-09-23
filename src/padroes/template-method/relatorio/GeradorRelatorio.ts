/**
 * TEMPLATE METHOD — Exemplo 2: Geração de relatórios.
 *
 * Cabeçalho, numeração, totalizador e rodapé seguem o mesmo layout
 * para todo relatório do NEXORA. Cada relatório só informa
 * O QUE coletar e COMO formatar uma linha.
 */
export abstract class GeradorRelatorio<T> {

  /** MÉTODO TEMPLATE. */
  public gerar(): string {
    const dados = this.coletarDados();
    const linhas: string[] = [this.montarCabecalho()];

    if (dados.length === 0) {
      linhas.push('  (sem registros)');
    }
    dados.forEach((d, i) => linhas.push(`  ${i + 1}. ${this.formatarLinha(d)}`));

    if (this.incluirTotalizador()) {          // hook
      linhas.push(this.montarTotalizador(dados));
    }
    linhas.push(this.montarRodape(dados.length));
    return linhas.join('\n');
  }

  // Passos comuns
  protected montarCabecalho(): string {
    return `=== ${this.titulo().toUpperCase()} ===`;
  }

  protected montarRodape(quantidade: number): string {
    return `--- ${quantidade} registro(s) | gerado em ${new Date().toLocaleString('pt-BR')} ---`;
  }

  // Passos abstratos
  protected abstract titulo(): string;
  protected abstract coletarDados(): T[];
  protected abstract formatarLinha(item: T): string;

  // Hooks
  protected incluirTotalizador(): boolean { return false; }
  protected montarTotalizador(_dados: T[]): string { return ''; }
}
