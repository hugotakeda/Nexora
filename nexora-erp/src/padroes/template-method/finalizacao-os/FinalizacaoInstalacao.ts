import { FinalizacaoOS } from './FinalizacaoOS';
import { OrdemServico } from '../../../dominio/OrdemServico';
import { RegistroFeatures } from '../../../nucleo/RegistroFeatures';

/** Instalação: sempre exige assinatura e cobra os materiais à parte. */
export class FinalizacaoInstalacao extends FinalizacaoOS {
  protected nomeProcesso(): string { return 'Finalização de INSTALAÇÃO'; }

  protected registrarChecklist(os: OrdemServico): void {
    ['Equipamento fixado', 'Teste de funcionamento', 'Cliente orientado']
      .forEach((item) => os.adicionarChecklist(item));
    console.log(`   [2] Checklist de instalação: ${os.getChecklist().join(', ')}`);
  }

  protected calcularValorCobranca(os: OrdemServico): number {
    return os.getValorOrcado() + os.custoMateriais();
  }

  protected exigeAssinatura(): boolean { return true; } // termo de aceite obrigatório

  protected aposFinalizar(os: OrdemServico): void {
    const empresaId = os.getCliente().getEmpresaId();
    if (RegistroFeatures.getInstance().estaHabilitada(empresaId, 'controle-garantia')) {
      console.log('   [6] Garantia de 90 dias registrada');
    } else {
      console.log('   [6] Produto contratado não possui controle de garantia');
    }
  }
}
