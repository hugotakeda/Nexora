import { ModuloCrud } from '../../nucleo/tipos';
import { Validacoes } from '../../nucleo/validacao';

/** Tela 2 do Integrante 1 — catálogo de serviços que a empresa vende. */
export const moduloServicos: ModuloCrud = {
  id: 'servicos',
  titulo: 'Serviços',
  subtitulo: 'Catálogo de serviços, com preço de tabela e tempo estimado.',
  tabela: 'servico',
  prefixoId: 'SRV',
  feature: 'servicos',
  porEmpresa: true,
  ordenarPor: 'descricao',
  buscarEm: ['descricao', 'categoria'],
  responsavel: 'Integrante 1',
  campos: [
    { nome: 'descricao', rotulo: 'Serviço', tipo: 'texto', obrigatorio: true, listar: true,
      placeholder: 'Instalação de ar-condicionado' },
    { nome: 'categoria', rotulo: 'Especialidade exigida', tipo: 'selecao', obrigatorio: true, listar: true,
      opcoes: ['refrigeracao', 'eletrica', 'hidraulica', 'informatica', 'mecanica'] },
    { nome: 'preco_base', rotulo: 'Preço de tabela', tipo: 'moeda', obrigatorio: true, listar: true, validar: Validacoes.positivo },
    { nome: 'valor_hora', rotulo: 'Valor da hora', tipo: 'moeda', obrigatorio: true, validar: Validacoes.positivo },
    { nome: 'duracao_horas', rotulo: 'Duração estimada (h)', tipo: 'numero', obrigatorio: true, listar: true, validar: Validacoes.positivo },
  ],
  validarRegistro: (d) =>
    Number(d.valor_hora) * Number(d.duracao_horas) < Number(d.preco_base) / 10
      ? 'Valor da hora muito baixo para a duração informada. Revise os valores.'
      : null,
};
