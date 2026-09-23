import { DistribuicaoTecnico } from './DistribuicaoTecnico';
import { OrdemServico } from '../../../dominio/OrdemServico';
import { Tecnico } from '../../../dominio/Tecnico';

/** Escolhe o técnico com menos OS em aberto (balanceamento de carga). */
export class MenorCarga implements DistribuicaoTecnico {
  public selecionar(_os: OrdemServico, candidatos: Tecnico[]): Tecnico | null {
    return candidatos
      .filter((t) => t.temCapacidade())
      .reduce<Tecnico | null>((melhor, t) =>
        !melhor || t.getOrdensEmAberto() < melhor.getOrdensEmAberto() ? t : melhor, null);
  }

  public descricao(): string { return 'Menor carga de trabalho'; }
}
