import { Router, Request, Response } from 'express';
import { ModuloCrud, Registro } from './tipos';
import { RepositorioBase } from './RepositorioBase';
import { validarRegistro } from './validacao';
import { ResolvedorVariabilidade } from './LinhaProduto';

/**
 * CORE ASSET — controlador REST genérico.
 *
 * Gera as cinco rotas do CRUD para qualquer módulo declarado, e bloqueia o
 * acesso quando a feature correspondente está desligada para a empresa.
 */
export function criarControladorCrud(modulo: ModuloCrud, empresaId: string): Router {
  const rotas = Router();
  const repositorio = new RepositorioBase(modulo);
  const variabilidade = new ResolvedorVariabilidade();

  // Porta de variabilidade: tela desligada no produto contratado responde 403.
  rotas.use(async (_req: Request, res: Response, proximo) => {
    const ativas = await variabilidade.featuresAtivas(empresaId);
    if (!ativas.includes(modulo.feature)) {
      return res.status(403).json({ erro: `O módulo "${modulo.titulo}" não faz parte do produto contratado.` });
    }
    proximo();
  });

  // READ — lista
  rotas.get('/', async (req, res) => {
    res.json(await repositorio.listar(empresaId, String(req.query.busca ?? '')));
  });

  // READ — um registro
  rotas.get('/:id', async (req, res) => {
    const registro = await repositorio.buscarPorId(String(req.params.id), empresaId);
    if (!registro) return res.status(404).json({ erro: 'Registro não encontrado.' });
    res.json(registro);
  });

  // CREATE
  rotas.post('/', async (req, res) => {
    const dados = req.body as Registro;
    const erro = validarRegistro(modulo, dados);
    if (erro) return res.status(400).json({ erro });
    const id = await repositorio.proximoId();
    res.status(201).json(await repositorio.criar(id, empresaId, dados));
  });

  // UPDATE
  rotas.put('/:id', async (req, res) => {
    const dados = req.body as Registro;
    const erro = validarRegistro(modulo, dados);
    if (erro) return res.status(400).json({ erro });
    const atualizado = await repositorio.atualizar(String(req.params.id), empresaId, dados);
    if (!atualizado) return res.status(404).json({ erro: 'Registro não encontrado.' });
    res.json(atualizado);
  });

  // DELETE
  rotas.delete('/:id', async (req, res) => {
    const removido = await repositorio.excluir(String(req.params.id), empresaId);
    if (!removido) return res.status(404).json({ erro: 'Registro não encontrado.' });
    res.status(204).send();
  });

  return rotas;
}
