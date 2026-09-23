import express from 'express';
import path from 'path';
import { ConexaoBanco } from '../nucleo/ConexaoBanco';
import { criarControladorCrud } from '../nucleo/ControladorCrud';
import { RepositorioBase } from '../nucleo/RepositorioBase';
import {
  FEATURES_OBRIGATORIAS, FEATURES_OPCIONAIS, NomeLinhaProduto, PRODUTOS, ResolvedorVariabilidade,
} from '../nucleo/LinhaProduto';
import { MODULOS, buscarModulo } from '../modulos';
import { traduzirErroBanco } from '../nucleo/errosBanco';

// Carrega o arquivo .env da raiz, se existir (recurso nativo do Node 20.12+).
// Sem .env, valem os padrões abaixo, que batem com o docker-compose.yml.
try {
  process.loadEnvFile();
} catch {
  /* sem .env: segue com as variáveis do sistema e os padrões */
}

const EMPRESA_ID = process.env.EMPRESA_ID ?? 'EMP-1';
const PORTA = Number(process.env.PORT ?? 3000);

const app = express();
const variabilidade = new ResolvedorVariabilidade();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

/** Saúde da aplicação: usado no guia de instalação para diagnosticar o ambiente. */
app.get('/api/saude', async (_req, res) => {
  try {
    await ConexaoBanco.getInstance().testarConexao();
    res.json({ aplicacao: 'ok', banco: 'ok', empresa: EMPRESA_ID });
  } catch {
    res.status(503).json({ aplicacao: 'ok', banco: 'indisponível', empresa: EMPRESA_ID });
  }
});

/** Metadados que o front usa para montar o menu e as telas. */
app.get('/api/modulos', async (_req, res) => {
  const ativas = await variabilidade.featuresAtivas(EMPRESA_ID);
  res.json(MODULOS.map((m) => ({
    id: m.id, titulo: m.titulo, subtitulo: m.subtitulo, feature: m.feature,
    responsavel: m.responsavel, ordenarPor: m.ordenarPor,
    disponivel: ativas.includes(m.feature),
    campos: m.campos.map(({ validar, ...campo }) => campo),
  })));
});

/** Estado atual da variabilidade (usado pela tela "Linha de produto"). */
app.get('/api/variabilidade', async (_req, res) => {
  const linha = await variabilidade.linhaDaEmpresa(EMPRESA_ID);
  res.json({
    linhaAtual: linha,
    produtos: PRODUTOS,
    obrigatorias: FEATURES_OBRIGATORIAS,
    opcionais: FEATURES_OPCIONAIS,
    ativas: await variabilidade.featuresAtivas(EMPRESA_ID),
    telasPorFeature: Object.fromEntries(MODULOS.map((m) => [m.feature, m.titulo])),
  });
});

app.put('/api/variabilidade/linha', async (req, res) => {
  const linha = String(req.body?.linha) as NomeLinhaProduto;
  if (!PRODUTOS[linha]) return res.status(400).json({ erro: 'Produto inválido.' });
  await variabilidade.trocarLinhaProduto(EMPRESA_ID, linha);
  res.json({ ativas: await variabilidade.featuresAtivas(EMPRESA_ID) });
});

app.put('/api/variabilidade/feature', async (req, res) => {
  try {
    await variabilidade.definirFeature(EMPRESA_ID, String(req.body?.feature), Boolean(req.body?.habilitada));
    res.json({ ativas: await variabilidade.featuresAtivas(EMPRESA_ID) });
  } catch (e) {
    res.status(400).json({ erro: e instanceof Error ? e.message : 'Não foi possível alterar a feature.' });
  }
});

/** Opções dos campos de referência (chaves estrangeiras). */
app.get('/api/opcoes/:modulo', async (req, res) => {
  const modulo = buscarModulo(String(req.params.modulo));
  if (!modulo) return res.status(404).json({ erro: 'Módulo não encontrado.' });
  const rotulo = String(req.query.rotulo ?? 'nome');
  if (!modulo.campos.some((c) => c.nome === rotulo)) {
    return res.status(400).json({ erro: 'Coluna de rótulo inválida.' });
  }
  res.json(await new RepositorioBase(modulo).opcoes(EMPRESA_ID, rotulo));
});

// As oito telas CRUD, todas geradas pelo mesmo core asset.
for (const modulo of MODULOS) {
  app.use(`/api/${modulo.id}`, criarControladorCrud(modulo, EMPRESA_ID));
}

/**
 * Tratamento central de erros. O Express 5 encaminha para cá qualquer exceção
 * das rotas assíncronas. Erros conhecidos do MySQL viram mensagem de usuário;
 * o resto vira 500 com texto neutro, sem expor stack trace na tela.
 */
app.use((e: unknown, _req: express.Request, res: express.Response, _proximo: express.NextFunction) => {
  const traduzido = traduzirErroBanco(e);
  if (traduzido) return res.status(traduzido.status).json({ erro: traduzido.erro });
  console.error('[API] Erro inesperado:', e);
  res.status(500).json({ erro: 'Algo deu errado ao processar o pedido. Tente de novo em instantes.' });
});

async function iniciar(): Promise<void> {
  try {
    await ConexaoBanco.getInstance().testarConexao();
    console.log('[API] Banco de dados respondeu.');
  } catch (e) {
    console.error('[API] Falha ao conectar no MySQL. Confira as variáveis DB_* e rode banco/schema.sql.');
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
  app.listen(PORTA, () => {
    console.log(`[API] NEXORA em http://localhost:${PORTA}`);
    console.log(`[API] ${MODULOS.length} módulos CRUD carregados: ${MODULOS.map((m) => m.id).join(', ')}`);
  });
}

iniciar();
