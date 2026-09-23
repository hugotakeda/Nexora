import { ModuloCrud } from '../../nucleo/tipos';

/** Tela 2 do Integrante 3 — execução dos atendimentos. */
export const moduloOrdensServico: ModuloCrud = {
  id: 'ordens-servico',
  titulo: 'Ordens de serviço',
  subtitulo: 'Atendimentos em aberto, em execução e concluídos.',
  tabela: 'ordem_servico',
  prefixoId: 'OS',
  feature: 'ordens-servico',
  porEmpresa: true,
  ordenarPor: 'criado_em DESC',
  buscarEm: ['descricao', 'status', 'endereco'],
  responsavel: 'Integrante 3',
  campos: [
    { nome: 'descricao', rotulo: 'Descrição do atendimento', tipo: 'texto', obrigatorio: true, listar: true,
      placeholder: 'Troca do compressor da câmara fria' },
    { nome: 'cliente_id', rotulo: 'Cliente', tipo: 'referencia', obrigatorio: true, listar: true,
      referencia: { modulo: 'clientes', rotulo: 'nome' } },
    { nome: 'servico_id', rotulo: 'Serviço', tipo: 'referencia', obrigatorio: true, listar: true,
      referencia: { modulo: 'servicos', rotulo: 'descricao' } },
    { nome: 'tecnico_id', rotulo: 'Técnico responsável', tipo: 'referencia', listar: true,
      referencia: { modulo: 'tecnicos', rotulo: 'nome' } },
    { nome: 'status', rotulo: 'Situação', tipo: 'selecao', obrigatorio: true, listar: true,
      opcoes: ['ABERTA', 'AGENDADA', 'EM_EXECUCAO', 'CONCLUIDA', 'CANCELADA'] },
    { nome: 'endereco', rotulo: 'Local do atendimento', tipo: 'texto', largo: true,
      placeholder: 'Av. das Torres, 2000 - Curitiba' },
  ],
  validarRegistro: (d) =>
    ['AGENDADA', 'EM_EXECUCAO', 'CONCLUIDA'].includes(String(d.status)) && !d.tecnico_id
      ? 'Defina o técnico responsável antes de agendar, executar ou concluir a OS.' : null,
};
