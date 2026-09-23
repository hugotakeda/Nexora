import { OrdemServico } from '../../../dominio/OrdemServico';
import { Tecnico } from '../../../dominio/Tecnico';

/**
 * STRATEGY — Exemplo 2: Regra de escolha do técnico para uma OS.
 * Contexto: GerenciadorDespacho.
 */
export interface DistribuicaoTecnico {
  selecionar(os: OrdemServico, candidatos: Tecnico[]): Tecnico | null;
  descricao(): string;
}
