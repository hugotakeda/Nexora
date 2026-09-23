import { ModuloCrud } from '../nucleo/tipos';
import { moduloClientes } from './clientes/clientes.modulo';
import { moduloServicos } from './servicos/servicos.modulo';
import { moduloTecnicos } from './tecnicos/tecnicos.modulo';
import { moduloAgendamentos } from './agendamentos/agendamentos.modulo';
import { moduloOrcamentos } from './orcamentos/orcamentos.modulo';
import { moduloOrdensServico } from './ordens-servico/ordens-servico.modulo';
import { moduloEstoque } from './estoque/estoque.modulo';
import { moduloFinanceiro } from './financeiro/financeiro.modulo';

/** Os oito módulos CRUD do NEXORA, na ordem em que aparecem no menu. */
export const MODULOS: ModuloCrud[] = [
  moduloClientes,
  moduloServicos,
  moduloOrcamentos,
  moduloOrdensServico,
  moduloTecnicos,
  moduloAgendamentos,
  moduloEstoque,
  moduloFinanceiro,
];

export function buscarModulo(id: string): ModuloCrud | undefined {
  return MODULOS.find((m) => m.id === id);
}
