/**
 * CORE ASSET — tradução de erros do MySQL para mensagens de usuário.
 *
 * As restrições do banco (UNIQUE e FOREIGN KEY) são a última linha de defesa
 * da integridade. Quando uma delas dispara, o erro técnico do MySQL vira uma
 * resposta HTTP com mensagem que diz o que houve e o que fazer.
 * Fica no núcleo porque vale igual para as oito telas.
 */
export interface ErroTraduzido {
  status: number;
  erro: string;
}

export function traduzirErroBanco(e: unknown): ErroTraduzido | null {
  const codigo = (e as { code?: string })?.code;
  switch (codigo) {
    case 'ER_DUP_ENTRY':
      return { status: 409, erro: 'Já existe um registro com esses dados. Confira o documento ou o código informado.' };
    case 'ER_ROW_IS_REFERENCED':
    case 'ER_ROW_IS_REFERENCED_2':
      return { status: 409, erro: 'Este registro está sendo usado em outra tela e não pode ser excluído. Remova ou altere os vínculos primeiro.' };
    case 'ER_NO_REFERENCED_ROW':
    case 'ER_NO_REFERENCED_ROW_2':
      return { status: 400, erro: 'Um dos itens selecionados não existe mais. Atualize a página e escolha de novo.' };
    case 'ER_DATA_TOO_LONG':
      return { status: 400, erro: 'Um dos campos passou do tamanho permitido. Encurte o texto e tente de novo.' };
    case 'ECONNREFUSED':
    case 'PROTOCOL_CONNECTION_LOST':
      return { status: 503, erro: 'O banco de dados não está respondendo. Verifique se o MySQL está ligado.' };
    default:
      return null;
  }
}
