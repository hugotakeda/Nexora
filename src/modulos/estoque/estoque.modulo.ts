import { ModuloCrud } from '../../nucleo/tipos';
import { Validacoes } from '../../nucleo/validacao';

/** Tela 1 do Integrante 4 — peças e materiais. */
export const moduloEstoque: ModuloCrud = {
  id: 'estoque',
  titulo: 'Estoque',
  subtitulo: 'Peças e materiais consumidos nos atendimentos.',
  tabela: 'item_estoque',
  prefixoId: 'ITM',
  feature: 'estoque',
  porEmpresa: true,
  ordenarPor: 'descricao',
  buscarEm: ['sku', 'descricao'],
  responsavel: 'Integrante 4',
  campos: [
    { nome: 'sku', rotulo: 'Código (SKU)', tipo: 'texto', obrigatorio: true, listar: true,
      placeholder: 'TUBO-COBRE-3M', validar: Validacoes.sku },
    { nome: 'descricao', rotulo: 'Descrição', tipo: 'texto', obrigatorio: true, listar: true, placeholder: 'Tubo de cobre 3 m' },
    { nome: 'quantidade', rotulo: 'Quantidade em estoque', tipo: 'numero', obrigatorio: true, listar: true, validar: Validacoes.naoNegativo },
    { nome: 'estoque_minimo', rotulo: 'Estoque mínimo', tipo: 'numero', obrigatorio: true, listar: true,
      ajuda: 'Abaixo desse número a peça aparece destacada na lista.', validar: Validacoes.naoNegativo },
    { nome: 'custo_unitario', rotulo: 'Custo unitário', tipo: 'moeda', obrigatorio: true, listar: true, validar: Validacoes.positivo },
  ],
};
