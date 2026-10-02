import path from "node:path";

/**
 * Descobre a raiz usada para arquivos externos da aplicação.
 *
 * Desenvolvimento:
 *   usa a pasta atual do projeto.
 *
 * Executável Node SEA:
 *   usa a pasta onde o nexora.exe está localizado.
 */
function detectarRaiz(): string {
  try {
    const sea = require("node:sea");

    if (sea.isSea()) {
      return path.dirname(process.execPath);
    }
  } catch {
    // Não estamos executando como SEA.
  }

  return process.cwd();
}

export const RAIZ = detectarRaiz();

export const PASTA_PUBLIC = path.join(RAIZ, "public");
