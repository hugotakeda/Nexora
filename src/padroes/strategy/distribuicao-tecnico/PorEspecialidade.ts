import { DistribuicaoTecnico } from './DistribuicaoTecnico';
import { MenorCarga } from './MenorCarga';
import { OrdemServico } from '../../../dominio/OrdemServico';
import { Tecnico } from '../../../dominio/Tecnico';

/**
 * Filtra quem tem a especialidade exigida pelo serviço e,
 * no empate, REUTILIZA a estratégia MenorCarga.
 */
export class PorEspecialidade implements DistribuicaoTecnico {
  private readonly desempate: DistribuicaoTecnico = new MenorCarga();

  public selecionar(os: OrdemServico, candidatos: Tecnico[]): Tecnico | null {
    const exigida = os.getServicoPrincipal().getCategoria();
    const aptos = candidatos.filter((t) => t.possuiEspecialidade(exigida));
    return this.desempate.selecionar(os, aptos);
  }

  public descricao(): string { return 'Especialidade exigida (desempate: menor carga)'; }
}
