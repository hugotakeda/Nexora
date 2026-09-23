import { ModuloCrud } from '../../nucleo/tipos';
import { Validacoes } from '../../nucleo/validacao';

/** Tela 1 do Integrante 2 — equipe de campo. */
export const moduloTecnicos: ModuloCrud = {
  id: 'tecnicos',
  titulo: 'Técnicos',
  subtitulo: 'Equipe de campo, especialidades e capacidade de atendimento.',
  tabela: 'tecnico',
  prefixoId: 'TEC',
  feature: 'tecnicos',
  porEmpresa: true,
  ordenarPor: 'nome',
  buscarEm: ['nome', 'especialidade'],
  responsavel: 'Integrante 2',
  campos: [
    { nome: 'nome', rotulo: 'Nome', tipo: 'texto', obrigatorio: true, listar: true, placeholder: 'Ana Ribeiro' },
    { nome: 'especialidade', rotulo: 'Especialidade', tipo: 'selecao', obrigatorio: true, listar: true,
      opcoes: ['refrigeracao', 'eletrica', 'hidraulica', 'informatica', 'mecanica'] },
    { nome: 'telefone', rotulo: 'Telefone', tipo: 'telefone', listar: true, placeholder: '(41) 98888-0000' },
    { nome: 'capacidade_maxima', rotulo: 'OS simultâneas', tipo: 'numero', obrigatorio: true, listar: true,
      ajuda: 'Quantas ordens o técnico consegue tocar ao mesmo tempo.', validar: Validacoes.positivo },
    { nome: 'disponivel', rotulo: 'Disponível para novas OS', tipo: 'booleano', listar: true },
  ],
};
