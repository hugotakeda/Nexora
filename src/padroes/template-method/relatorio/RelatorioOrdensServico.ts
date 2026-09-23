import { GeradorRelatorio } from './GeradorRelatorio';
import { OrdemServico, StatusOS } from '../../../dominio/OrdemServico';

/** Relatório operacional de OS, com filtro opcional por status. Sem totalizador. */
export class RelatorioOrdensServico extends GeradorRelatorio<OrdemServico> {
  private readonly ordens: OrdemServico[];
  private readonly filtroStatus: StatusOS | null;

  constructor(ordens: OrdemServico[], filtroStatus: StatusOS | null = null) {
    super();
    this.ordens = ordens;
    this.filtroStatus = filtroStatus;
  }

  protected titulo(): string {
    return `Ordens de Serviço${this.filtroStatus ? ` (${this.filtroStatus})` : ''}`;
  }

  protected coletarDados(): OrdemServico[] {
    return this.filtroStatus
      ? this.ordens.filter((o) => o.getStatus() === this.filtroStatus)
      : this.ordens;
  }

  protected formatarLinha(os: OrdemServico): string {
    return `${os.getId()} | ${os.getCliente().getNome()} | ` +
      `${os.getServicoPrincipal().getDescricao()} | técnico: ${os.getTecnico()?.getNome() ?? '-'} | ${os.getStatus()}`;
  }
}
