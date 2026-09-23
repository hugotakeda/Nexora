import { DistribuicaoTecnico } from './DistribuicaoTecnico';
import { OrdemServico } from '../../../dominio/OrdemServico';
import { Tecnico } from '../../../dominio/Tecnico';

/** CONTEXTO do Strategy de distribuição. */
export class GerenciadorDespacho {
  private estrategia: DistribuicaoTecnico;
  private readonly equipe: Tecnico[];

  constructor(equipe: Tecnico[], estrategia: DistribuicaoTecnico) {
    this.equipe = equipe;
    this.estrategia = estrategia;
  }

  public setEstrategia(estrategia: DistribuicaoTecnico): void {
    this.estrategia = estrategia;
  }

  public despachar(os: OrdemServico): Tecnico {
    const escolhido = this.estrategia.selecionar(os, this.equipe);
    if (!escolhido) {
      throw new Error(`Nenhum técnico elegível para ${os.getId()} (${this.estrategia.descricao()}).`);
    }
    os.atribuirTecnico(escolhido);
    return escolhido;
  }
}
