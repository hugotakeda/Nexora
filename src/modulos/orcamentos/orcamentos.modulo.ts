import { ModuloCrud } from '../../nucleo/tipos';
import { Validacoes } from '../../nucleo/validacao';

/** Tela 1 do Integrante 3 — propostas enviadas aos clientes. */
export const moduloOrcamentos: ModuloCrud = {
  id: 'orcamentos',
  titulo: 'Orçamentos',
  subtitulo: 'Propostas enviadas ao cliente antes da abertura da ordem de serviço.',
  tabela: 'orcamento',
  prefixoId: 'ORC',
  feature: 'orcamentos',
  porEmpresa: true,
  ordenarPor: 'criado_em DESC',
  buscarEm: ['descricao', 'status'],
  responsavel: 'Integrante 3',
  campos: [
    { nome: 'cliente_id', rotulo: 'Cliente', tipo: 'referencia', obrigatorio: true, listar: true,
      referencia: { modulo: 'clientes', rotulo: 'nome' } },
    { nome: 'descricao', rotulo: 'Descrição', tipo: 'texto', obrigatorio: true, listar: true,
      placeholder: 'Instalação de 2 splits na cozinha' },
    { nome: 'estrategia_preco', rotulo: 'Forma de precificação', tipo: 'selecao', obrigatorio: true, listar: true,
      opcoes: ['PRECO_FIXO', 'POR_HORA', 'POR_VISITA'],
      ajuda: 'Corresponde às estratégias do padrão Strategy implementado no projeto.' },
    { nome: 'valor_total', rotulo: 'Valor total', tipo: 'moeda', obrigatorio: true, listar: true, validar: Validacoes.positivo },
    { nome: 'validade_dias', rotulo: 'Validade (dias)', tipo: 'numero', obrigatorio: true, validar: Validacoes.positivo },
    { nome: 'status', rotulo: 'Situação', tipo: 'selecao', obrigatorio: true, listar: true,
      opcoes: ['RASCUNHO', 'ENVIADO', 'APROVADO', 'REPROVADO'] },
  ],
  validarRegistro: (d) =>
    d.status === 'APROVADO' && Number(d.valor_total) <= 0
      ? 'Um orçamento aprovado precisa de valor total maior que zero.' : null,
};
