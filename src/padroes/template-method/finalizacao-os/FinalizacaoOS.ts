import { OrdemServico } from '../../../dominio/OrdemServico';
import { MovimentacaoEstoque } from '../../../dominio/MovimentacaoEstoque';
import { LancamentoFinanceiro } from '../../../dominio/LancamentoFinanceiro';
import { ConexaoBanco } from '../../../nucleo/ConexaoBanco';
import { moeda } from '../../../util/formatacao';

/**
 * TEMPLATE METHOD — Exemplo 1: Finalização de Ordem de Serviço.
 *
 * O esqueleto (validar → checklist → baixar materiais → [assinatura] →
 * concluir → cobrar → pós-finalização) é IGUAL para todo tipo de OS
 * e fica aqui, uma única vez. As subclasses mudam só os passos variáveis.
 */
export abstract class FinalizacaoOS {
  protected readonly banco: ConexaoBanco = ConexaoBanco.getInstance();

  /**
   * MÉTODO TEMPLATE. Não deve ser sobrescrito pelas subclasses.
   * TypeScript não tem "final": a regra é garantida por convenção e revisão
   * de código — as subclasses só implementam os passos abstratos e os hooks.
   */
  public async finalizar(os: OrdemServico): Promise<LancamentoFinanceiro> {
    console.log(`\n>> ${this.nomeProcesso()} — OS ${os.getId()}`);
    this.validarExecucao(os);
    this.registrarChecklist(os);
    await this.baixarMateriais(os);
    if (this.exigeAssinatura(os)) {       // hook (como o acrescentarMilho() da pizza)
      this.coletarAssinatura(os);
    }
    os.concluir();
    const lancamento = await this.gerarCobranca(os);
    this.aposFinalizar(os);               // hook
    return lancamento;
  }

  // ---------- Passos COMUNS (reutilizados por todas as subclasses) ----------
  protected validarExecucao(os: OrdemServico): void {
    if (os.getStatus() !== 'EM_EXECUCAO') {
      throw new Error(`OS ${os.getId()} não está em execução.`);
    }
    console.log(`   [1] Execução validada (técnico: ${os.getTecnico()?.getNome()})`);
  }

  protected async baixarMateriais(os: OrdemServico): Promise<void> {
    const materiais = os.getMateriais();
    if (materiais.length === 0) {
      console.log('   [3] Nenhum material a baixar');
      return;
    }
    for (const m of materiais) {
      const mov = new MovimentacaoEstoque(m.item, 'SAIDA', m.quantidade, `Consumo OS ${os.getId()}`);
      mov.aplicar();
      await this.banco.executar('INSERT INTO movimentacao_estoque (id, sku, tipo, qtd) VALUES (?,?,?,?)',
        [mov.getId(), m.item.getSku(), 'SAIDA', m.quantidade]);
      console.log(`   [3] Baixa: ${mov.descricao()} → saldo ${m.item.getQuantidade()}`);
    }
  }

  protected coletarAssinatura(os: OrdemServico): void {
    os.registrarAssinatura(os.getCliente().getNome());
    console.log(`   [4] Assinatura coletada de ${os.getAssinaturaCliente()}`);
  }

  protected async gerarCobranca(os: OrdemServico): Promise<LancamentoFinanceiro> {
    const valor = this.calcularValorCobranca(os);
    const vencimento = new Date();
    vencimento.setDate(vencimento.getDate() + this.prazoPagamentoDias());
    const lancamento = new LancamentoFinanceiro(
      `LAN-${os.getId()}`, 'RECEITA', `Cobrança da ${os.getId()}`, valor, vencimento);
    await this.banco.executar('INSERT INTO lancamento_financeiro (id, tipo, valor) VALUES (?,?,?)',
      [lancamento.getId(), 'RECEITA', valor]);
    console.log(`   [5] Cobrança gerada: ${moeda(valor)} (vence em ${this.prazoPagamentoDias()} dias)`);
    return lancamento;
  }

  // ---------- Passos ABSTRATOS (obrigatórios nas subclasses) ----------
  protected abstract nomeProcesso(): string;
  protected abstract registrarChecklist(os: OrdemServico): void;
  protected abstract calcularValorCobranca(os: OrdemServico): number;

  // ---------- HOOKS (opcionais: têm comportamento padrão) ----------
  protected exigeAssinatura(_os: OrdemServico): boolean { return false; }
  protected aposFinalizar(_os: OrdemServico): void { /* padrão: nada */ }
  protected prazoPagamentoDias(): number { return 30; }
}
