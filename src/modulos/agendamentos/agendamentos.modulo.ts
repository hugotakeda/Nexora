import { ModuloCrud } from '../../nucleo/tipos';
import { Validacoes } from '../../nucleo/validacao';

/** Tela 2 do Integrante 2 — agenda dos atendimentos. */
export const moduloAgendamentos: ModuloCrud = {
  id: 'agendamentos',
  titulo: 'Agenda',
  subtitulo: 'Horários reservados na agenda de cada técnico.',
  tabela: 'agendamento',
  prefixoId: 'AGD',
  feature: 'agenda',
  porEmpresa: true,
  ordenarPor: 'inicio',
  buscarEm: ['observacao'],
  responsavel: 'Integrante 2',
  campos: [
    { nome: 'ordem_id', rotulo: 'Ordem de serviço', tipo: 'referencia', obrigatorio: true, listar: true,
      referencia: { modulo: 'ordens-servico', rotulo: 'descricao' } },
    { nome: 'tecnico_id', rotulo: 'Técnico', tipo: 'referencia', obrigatorio: true, listar: true,
      referencia: { modulo: 'tecnicos', rotulo: 'nome' } },
    { nome: 'inicio', rotulo: 'Início', tipo: 'datahora', obrigatorio: true, listar: true },
    { nome: 'duracao_horas', rotulo: 'Duração (h)', tipo: 'numero', obrigatorio: true, listar: true, validar: Validacoes.positivo },
    { nome: 'confirmado', rotulo: 'Confirmado com o cliente', tipo: 'booleano', listar: true },
    { nome: 'observacao', rotulo: 'Observação', tipo: 'textolongo', largo: true,
      placeholder: 'Portaria exige aviso com 30 minutos de antecedência.' },
  ],
  validarRegistro: (d) =>
    Number(d.duracao_horas) > 12 ? 'Um agendamento não pode passar de 12 horas. Divida em dois atendimentos.' : null,
};
