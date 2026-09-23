import { Empresa, LinhaProduto } from '../dominio/Empresa';
import { FEATURES_OBRIGATORIAS, PRODUTOS } from './LinhaProduto';

/**
 * SINGLETON — Exemplo 2: Registro central de features (feature toggles).
 *
 * É o ponto único, em memória, que responde "esta empresa tem a feature X?".
 * Se existissem duas instâncias, partes do sistema poderiam enxergar
 * configurações diferentes para a mesma empresa.
 *
 * A variabilidade tem dois níveis de granularidade:
 *  - MÓDULOS (telas): vêm do modelo único em `LinhaProduto.ts` —
 *    núcleo obrigatório + opcionais do produto contratado. Não são
 *    redeclarados aqui, para existir uma só fonte da verdade.
 *  - COMPORTAMENTOS: variações finas dentro de um módulo, consultadas pelos
 *    hooks do Template Method (ex.: `controle-garantia` na finalização de
 *    uma instalação). Só existem neste registro.
 */
export class RegistroFeatures {
  private static instancia: RegistroFeatures | null = null;

  private static readonly COMPORTAMENTOS_POR_LINHA: Record<LinhaProduto, string[]> = {
    CORE: [],
    TECH: ['controle-garantia', 'laudo-tecnico'],
    MAINT: ['manutencao-preventiva', 'contratos-recorrentes'],
    FIELD: ['controle-garantia', 'assinatura-digital', 'rastreamento-gps', 'app-offline',
      'manutencao-preventiva'],
  };

  private readonly featuresPorEmpresa: Map<string, Set<string>>;

  private constructor() {
    this.featuresPorEmpresa = new Map();
    console.log('[RegistroFeatures] >>> Instância criada (esta mensagem deve aparecer UMA vez)');
  }

  public static getInstance(): RegistroFeatures {
    if (RegistroFeatures.instancia === null) {
      RegistroFeatures.instancia = new RegistroFeatures();
    }
    return RegistroFeatures.instancia;
  }

  /** Carrega núcleo + módulos opcionais do produto + comportamentos do produto. */
  public aplicarLinhaProduto(empresa: Empresa): void {
    const linha = empresa.getLinhaProduto();
    const features = new Set<string>([
      ...FEATURES_OBRIGATORIAS,
      ...PRODUTOS[linha].opcionais,
      ...RegistroFeatures.COMPORTAMENTOS_POR_LINHA[linha],
    ]);
    this.featuresPorEmpresa.set(empresa.getId(), features);
  }

  public habilitar(empresaId: string, feature: string): void {
    this.obterConjunto(empresaId).add(feature);
  }

  public desabilitar(empresaId: string, feature: string): void {
    this.obterConjunto(empresaId).delete(feature);
  }

  public estaHabilitada(empresaId: string, feature: string): boolean {
    return this.featuresPorEmpresa.get(empresaId)?.has(feature) ?? false;
  }

  public listar(empresaId: string): string[] {
    return [...(this.featuresPorEmpresa.get(empresaId) ?? [])];
  }

  private obterConjunto(empresaId: string): Set<string> {
    let conjunto = this.featuresPorEmpresa.get(empresaId);
    if (!conjunto) {
      conjunto = new Set();
      this.featuresPorEmpresa.set(empresaId, conjunto);
    }
    return conjunto;
  }
}
