import { ModuloCrud } from '../../nucleo/tipos';
import { Validacoes } from '../../nucleo/validacao';

/** Tela 1 do Integrante 1 — cadastro de clientes atendidos pela empresa. */
export const moduloClientes: ModuloCrud = {
  id: 'clientes',
  titulo: 'Clientes',
  subtitulo: 'Empresas e pessoas atendidas pela sua operação.',
  tabela: 'cliente',
  prefixoId: 'CLI',
  feature: 'clientes',
  porEmpresa: true,
  ordenarPor: 'nome',
  buscarEm: ['nome', 'documento', 'email'],
  responsavel: 'Integrante 1',
  campos: [
    { nome: 'nome', rotulo: 'Nome', tipo: 'texto', obrigatorio: true, listar: true, placeholder: 'Padaria Bom Pão' },
    { nome: 'documento', rotulo: 'CPF ou CNPJ', tipo: 'texto', obrigatorio: true, listar: true,
      placeholder: '98.765.432/0001-10', validar: Validacoes.documento },
    { nome: 'email', rotulo: 'E-mail', tipo: 'email', obrigatorio: true, listar: true, placeholder: 'contato@empresa.com.br' },
    { nome: 'telefone', rotulo: 'Telefone', tipo: 'telefone', placeholder: '(41) 99999-0000' },
    { nome: 'endereco', rotulo: 'Endereço', tipo: 'texto', largo: true, listar: true,
      placeholder: 'Rua XV de Novembro, 100 - Curitiba' },
  ],
};
