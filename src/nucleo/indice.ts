/**
 * @nexora/nucleo
 *
 * API pública dos componentes reutilizáveis do NEXORA.
 * Somente os elementos exportados neste arquivo fazem parte
 * do contrato público do pacote.
 */

// Banco de dados
export { ConexaoBanco } from "./ConexaoBanco";
export type { Parametro, ConfiguracaoBanco } from "./ConexaoBanco";

// Persistência genérica
export { RepositorioBase } from "./RepositorioBase";

// CRUD
export { criarControladorCrud } from "./ControladorCrud";

// Validação
export { Validacoes, validarRegistro } from "./validacao";

// Linha de Produto e variabilidade
export {
  FEATURES_OBRIGATORIAS,
  FEATURES_OPCIONAIS,
  PRODUTOS,
  ResolvedorVariabilidade,
} from "./LinhaProduto";

export type { NomeLinhaProduto } from "./LinhaProduto";

// Registro de features
export { RegistroFeatures } from "./RegistroFeatures";

// Tratamento de erros do banco
export { traduzirErroBanco } from "./errosBanco";

export type { ErroTraduzido } from "./errosBanco";

// Tipos reutilizáveis
export type { TipoCampo, CampoModulo, ModuloCrud, Registro } from "./tipos";

export { RAIZ, PASTA_PUBLIC } from "./caminhos";
