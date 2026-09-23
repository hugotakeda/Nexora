# CLAUDE.md

Contexto do projeto NEXORA para assistentes de IA que forem trabalhar neste repositório.
Leia este arquivo antes de gerar ou alterar código.

## O que é o projeto

NEXORA: ERP modular com Field Service Management para PMEs prestadoras de serviços (assistência técnica, refrigeração, elétrica, TI, manutenção). Projeto acadêmico da PUCPR, Engenharia de Software, disciplina **Desenvolvimento Orientado a Reúso de Software** (Prof. Tiago Navarro), feito por uma equipe de 4 integrantes.

Posicionamento: "NEXORA — Conectando toda a sua operação".

Fluxo do negócio: Cliente → Solicitação → Orçamento → Aprovação → OS → Agenda → Técnico → Execução → Materiais → Finalização → Cobrança → Financeiro → Indicadores.

**Escopo travado de propósito.** É um ERP vertical de serviços. Não transformar em "ERP completo para qualquer empresa" nem sugerir isso.

## Stack

- TypeScript 5.9 (strict) + Node.js 20.12+ (recomendado 24 LTS) + Express 5
- MySQL 8 via `mysql2/promise`, com pool, rodando em Docker (`docker-compose.yml`)
- Front-end sem framework: HTML, CSS e ES modules

Sem build de front, sem bundler, sem ORM. Isso é intencional: o professor precisa ler o código.

## Entregas da disciplina

1. **Design Patterns para reuso** (feita): 10 classes de domínio, Singleton (2 exemplos), Template Method (3) e Strategy (3).
2. **LPS com telas e banco** (feita): 8 CRUDs (2 por integrante), 11 tabelas no MySQL e um exemplo executável de variabilidade.

## Arquitetura

O coração do projeto é a separação entre **núcleo** e **módulos**:

- `src/nucleo/` — core assets da Linha de Produto. Código compartilhado pelas 8 telas.
- `src/modulos/<nome>/<nome>.modulo.ts` — cada tela é uma **declaração de dados** (`ModuloCrud`), não código repetido.
- `public/js/telaCrud.js` — renderiza qualquer módulo como tela CRUD.

Um módulo declara: tabela, prefixo de id, feature da LPS, campos (tipo, rótulo, validação) e regras de negócio. O núcleo gera o SQL, as rotas REST e a interface.

### Ao adicionar uma tela nova

1. Criar `src/modulos/<nome>/<nome>.modulo.ts` exportando um `ModuloCrud`.
2. Registrar em `src/modulos/index.ts`.
3. Criar a tabela em `banco/schema.sql`.
4. Se for uma feature opcional, incluir em `FEATURES_OPCIONAIS` e nos produtos que a recebem (`src/nucleo/LinhaProduto.ts`).

Não escrever controller, repositório nem HTML por tela. Se parecer que precisa, o caso provavelmente cabe como um tipo de campo novo no núcleo.

## Variabilidade (o ponto central da disciplina)

- Núcleo obrigatório: `clientes`, `servicos`, `ordens-servico`, `financeiro`.
- Opcionais: `orcamentos`, `tecnicos`, `agenda`, `estoque`.
- Produtos: CORE (só núcleo), TECH (+orçamentos, estoque), MAINT (+técnicos, agenda), FIELD (tudo).
- Resolução em **tempo de execução**, via `ResolvedorVariabilidade`, feature toggles e a tabela `empresa_feature`. Nunca em tempo de compilação, e nunca com `#ifdef` ou geração de código.
- `ControladorCrud` bloqueia com 403 quando a feature está desligada; `app.js` esconde o item no menu.

## Padrões de projeto presentes

| Padrão | Onde | Cuidado ao mexer |
|---|---|---|
| Singleton | `nucleo/ConexaoBanco.ts`, `nucleo/RegistroFeatures.ts` | Construtor privado e `getInstance()`. Nunca instanciar direto nem criar um segundo pool. |
| Template Method | `padroes/template-method/` | O método template define a sequência. O que é opcional vira **hook com implementação padrão**, nunca método abstrato que a subclasse implementa vazio. |
| Strategy | `padroes/strategy/` | Novas variações entram como classe nova, sem `if/else` no contexto. |

`ConexaoBanco` tem modo simulado (`ativarModoSimulado()`), usado por `src/Aplicacao.ts` para a demo rodar sem MySQL. Manter esse modo funcionando.

## Convenções

- **Tudo em português**: nomes de classes, métodos, variáveis, comentários, mensagens e commits. Colunas do banco em `snake_case`, código em `camelCase`, arquivos de módulo em `kebab-case`.
- Comentários explicam a decisão, não o óbvio. Comentário de classe diz qual papel ela cumpre na LPS ou no padrão.
- SQL sempre com `?` parametrizado. Nunca concatenar valor do usuário em string SQL.
- Ids gerados no servidor (`RepositorioBase.proximoId`), nunca aceitos do cliente.
- Isolamento multiempresa: toda consulta por id passa por `RepositorioBase.filtroId`, que inclui `empresa_id`. Não escrever SQL por id sem esse filtro.
- Erros do MySQL passam por `nucleo/errosBanco.ts` (middleware no fim de `api/servidor.ts`). Nunca devolver stack trace para a tela.
- Depois de mexer no núcleo ou em um módulo, rodar `npm run testar` e manter todas as verificações passando.
- Erros de validação voltam como `{ "erro": "mensagem para o usuário" }` com status 400; conflito é 409; feature desligada é 403.
- Mensagens de erro em linguagem de usuário: dizem o que houve e o que fazer, sem jargão e sem pedir desculpas.

## Interface

Design system do NEXORA, definido em `public/css/nexora.css`:

- Navy `#06265F` na navegação (domínio de gestão), azul `#0B5FD7` nas ações.
- Tipografia Inter. Raios de 8 e 12 px. Sombras discretas.
- Sidebar fixa + conteúdo. Responsivo até 360 px.
- Foco visível no teclado. Nada de cor como única forma de transmitir informação.
- Copy em frases curtas, tom conversacional, primeira letra maiúscula (não usar CAIXA ALTA em rótulos).

## Como rodar

```bash
npm install
npm run banco:subir   # MySQL 8 + Adminer no Docker; cria as tabelas na 1ª subida
npm start             # aplicação web em http://localhost:3000
npm run testar        # teste automático das 8 telas (com o sistema rodando)
npm run demo          # demonstração dos padrões no console, sem banco
```

Variáveis: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `EMPRESA_ID`, `PORT`.

## O que evitar neste repositório

- Introduzir ORM, framework de front ou bundler.
- Duplicar CRUD por entidade: se dois módulos precisam do mesmo comportamento, ele vai para o núcleo.
- Resolver variabilidade com `if (empresa === 'X')` espalhado pelo código. A decisão passa pelo `ResolvedorVariabilidade`.
- Reintroduzir uma segunda linguagem. Desde a versão 2.0 o projeto é só TypeScript (ver `docs/ARQUITETURA.md`, ADR-01).
- Declarar features de módulo fora de `LinhaProduto.ts`. `RegistroFeatures` lê de lá; ele só acrescenta features de comportamento.
- Inventar dados de demonstração que sugiram números reais de desempenho ou de clientes.
