import { FinalizacaoOS } from './FinalizacaoOS';
import { OrdemServico } from '../../../dominio/OrdemServico';
import { RegistroFeatures } from '../../../nucleo/RegistroFeatures';

/** Manutenção preventiva: materiais inclusos no contrato; assinatura depende da feature. */
export class FinalizacaoManutencaoPreventiva extends FinalizacaoOS {
  protected nomeProcesso(): string { return 'Finalização de MANUTENÇÃO PREVENTIVA'; }

  protected registrarChecklist(os: OrdemServico): void {
    ['Limpeza', 'Medição de pressão', 'Troca de filtros']
      .forEach((item) => os.adicionarChecklist(item));
    console.log(`   [2] Checklist de manutenção: ${os.getChecklist().join(', ')}`);
  }

  protected calcularValorCobranca(os: OrdemServico): number {
    return os.getValorOrcado(); // materiais já inclusos no contrato
  }

  protected exigeAssinatura(os: OrdemServico): boolean {
    return RegistroFeatures.getInstance()
      .estaHabilitada(os.getCliente().getEmpresaId(), 'assinatura-digital');
  }

  protected prazoPagamentoDias(): number { return 10; }

  protected aposFinalizar(os: OrdemServico): void {
    const proxima = new Date(os.getDataConclusao() ?? new Date());
    proxima.setMonth(proxima.getMonth() + 3);
    console.log(`   [6] Próxima preventiva sugerida para ${proxima.toLocaleDateString('pt-BR')}`);
  }
}
