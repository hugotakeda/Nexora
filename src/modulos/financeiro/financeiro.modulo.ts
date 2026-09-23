import { ModuloCrud } from '../../nucleo/tipos';
import { Validacoes } from '../../nucleo/validacao';

/** Tela 2 do Integrante 4 — contas a receber e a pagar. */
export const moduloFinanceiro: ModuloCrud = {
  id: 'financeiro',
  titulo: 'Financeiro',
  subtitulo: 'Contas a receber e a pagar da operação.',
  tabela: 'lancamento_financeiro',
  prefixoId: 'LAN',
  feature: 'financeiro',
  porEmpresa: true,
  ordenarPor: 'vencimento',
  buscarEm: ['descricao', 'status'],
  responsavel: 'Integrante 4',
  campos: [
    { nome: 'descricao', rotulo: 'Descrição', tipo: 'texto', obrigatorio: true, listar: true, placeholder: 'Cobrança da OS-0007' },
    { nome: 'tipo', rotulo: 'Tipo', tipo: 'selecao', obrigatorio: true, listar: true, opcoes: ['RECEITA', 'DESPESA'] },
    { nome: 'valor', rotulo: 'Valor', tipo: 'moeda', obrigatorio: true, listar: true, validar: Validacoes.positivo },
    { nome: 'vencimento', rotulo: 'Vencimento', tipo: 'data', obrigatorio: true, listar: true },
    { nome: 'status', rotulo: 'Situação', tipo: 'selecao', obrigatorio: true, listar: true,
      opcoes: ['PENDENTE', 'PAGO', 'CANCELADO'] },
    { nome: 'forma_pagamento', rotulo: 'Forma de pagamento', tipo: 'selecao', listar: true,
      opcoes: ['PIX', 'BOLETO', 'CARTAO'],
      ajuda: 'Corresponde às estratégias de pagamento do padrão Strategy.' },
  ],
  validarRegistro: (d) =>
    d.status === 'PAGO' && !d.forma_pagamento ? 'Informe a forma de pagamento ao marcar como pago.' : null,
};
