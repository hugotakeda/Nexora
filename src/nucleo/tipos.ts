/**
 * NÚCLEO DA LINHA DE PRODUTO (core asset)
 *
 * Um módulo CRUD do NEXORA é declarado como DADO, não como código repetido.
 * Cada integrante da equipe descreve suas telas com estas estruturas, e o
 * núcleo (repositório genérico + controlador REST + renderizador de tela)
 * transforma a descrição em um CRUD completo.
 */

export type TipoCampo = 'texto' | 'email' | 'telefone' | 'numero' | 'moeda'
  | 'data' | 'datahora' | 'booleano' | 'selecao' | 'referencia' | 'textolongo';

export interface CampoModulo {
  /** Nome da coluna no banco (snake_case). */
  nome: string;
  rotulo: string;
  tipo: TipoCampo;
  obrigatorio?: boolean;
  /** Aparece na tabela da listagem. */
  listar?: boolean;
  /** Ocupa a linha inteira do formulário. */
  largo?: boolean;
  /** Não é editável pelo usuário (ex.: totais calculados). */
  somenteLeitura?: boolean;
  placeholder?: string;
  ajuda?: string;
  /** Opções fixas, para tipo 'selecao'. */
  opcoes?: string[];
  /** Módulo de origem, para tipo 'referencia' (chave estrangeira). */
  referencia?: { modulo: string; rotulo: string };
  /** Validação específica do campo. Devolve a mensagem de erro ou null. */
  validar?: (valor: string) => string | null;
}

export interface ModuloCrud {
  /** Identificador usado na rota e na navegação (kebab-case). */
  id: string;
  titulo: string;
  subtitulo: string;
  /** Tabela do MySQL. */
  tabela: string;
  /** Prefixo dos ids gerados pelo servidor (ex.: CLI-0007). */
  prefixoId: string;
  /** Feature da Linha de Produto que habilita esta tela (variabilidade). */
  feature: string;
  /** Se true, os registros pertencem a uma empresa (multiempresa). */
  porEmpresa: boolean;
  /** Coluna usada na ordenação padrão da listagem. */
  ordenarPor: string;
  /** Colunas varridas pela busca da tela. */
  buscarEm: string[];
  campos: CampoModulo[];
  /** Regra de negócio que envolve mais de um campo. */
  validarRegistro?: (dados: Registro) => string | null;
  /** Responsável pela tela, exibido na documentação do projeto. */
  responsavel: string;
}

export type Registro = Record<string, string | number | boolean | null>;
