# @nexora/nucleo

Componentes reutilizáveis do núcleo do NEXORA, um ERP modular desenvolvido em TypeScript.

O pacote reúne funcionalidades que podem ser reutilizadas por outros projetos, como:

- persistência genérica;
- CRUD reutilizável;
- validação de registros;
- tratamento de erros do banco;
- gerenciamento de features;
- resolução de variabilidade da Linha de Produto de Software.

## Instalação

Após gerar o pacote com `npm pack`, ele pode ser instalado em outro projeto:

```bash
npm install ../caminho/nexora-nucleo-2.0.0.tgz
```

## Uso

Exemplo:

```javascript
const {
  RepositorioBase,
  PRODUTOS,
  validarRegistro,
} = require("@nexora/nucleo");

console.log(Object.keys(PRODUTOS));
console.log(typeof RepositorioBase);
console.log(typeof validarRegistro);
```

## API Pública

O contrato público do pacote é definido em:

`src/nucleo/indice.ts`

Entre os principais recursos disponíveis estão:

- `ConexaoBanco`
- `RepositorioBase`
- `criarControladorCrud`
- `Validacoes`
- `validarRegistro`
- `PRODUTOS`
- `ResolvedorVariabilidade`
- `RegistroFeatures`
- `traduzirErroBanco`

## Compatibilidade

- Node.js 24 ou superior
- TypeScript
- Express 5
- MySQL / mysql2
