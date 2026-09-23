import { DistribuicaoTecnico } from './DistribuicaoTecnico';
import { OrdemServico } from '../../../dominio/OrdemServico';
import { Tecnico } from '../../../dominio/Tecnico';

/** Escolhe o técnico disponível mais próximo do local de atendimento. */
export class MaisProximo implements DistribuicaoTecnico {
  public selecionar(os: OrdemServico, candidatos: Tecnico[]): Tecnico | null {
    const destino = os.getLocalAtendimento();
    return candidatos
      .filter((t) => t.temCapacidade())
      .reduce<Tecnico | null>((melhor, t) =>
        !melhor || t.distanciaAte(destino) < melhor.distanciaAte(destino) ? t : melhor, null);
  }

  public descricao(): string { return 'Mais próximo do cliente'; }
}
