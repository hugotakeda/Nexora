import * as esbuild from "esbuild";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));

const resultado = await esbuild.build({
  entryPoints: ["src/api/servidor.ts"],

  // Junta o código da aplicação e as dependências.
  bundle: true,

  // Compacta o JavaScript.
  minify: true,

  // Remove código que não é utilizado.
  treeShaking: true,

  // O destino é Node.js.
  platform: "node",

  // Estamos utilizando Node 24.
  target: "node24",

  // Formato usado posteriormente pelo Node SEA.
  format: "cjs",

  // Arquivo único gerado.
  outfile: "build/nexora.cjs",

  // Remove comentários legais do bundle.
  legalComments: "none",

  // Permite analisar o conteúdo do bundle.
  metafile: true,

  banner: {
    js: `/* NEXORA v${pkg.version} — bundle de distribuição */`,
  },
});

console.log(await esbuild.analyzeMetafile(resultado.metafile));
