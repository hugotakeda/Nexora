<div align="center">
  <h1>NEXORA</h1>
  <p><strong>ERP modular com Field Service para pequenas e médias empresas.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/versão-2.0-0B5FD7?style=flat-square" />
    <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/Node.js-24_LTS-339933?style=flat-square&logo=node.js&logoColor=white" />
    <img src="https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql&logoColor=white" />
    <img src="https://img.shields.io/badge/Docker-compose-2496ED?style=flat-square&logo=docker&logoColor=white" />
    <img src="https://img.shields.io/badge/licença-MIT-blue?style=flat-square" />
  </p>

  <p><em>PUCPR · Engenharia de Software · Desenvolvimento Orientado a Reúso de Software · Prof. Tiago Navarro</em></p>
</div>

---

## 📋 Sobre

O **NEXORA** é um ERP vertical para pequenas e médias empresas prestadoras de serviços (assistência técnica, refrigeração, elétrica, TI, manutenção). O projeto é construído como uma **Linha de Produto de Software (LPS)**: um núcleo comum e pontos de variação que geram quatro produtos diferentes a partir do mesmo código.

---

## 📦 O que está entregue

| Requisito do enunciado                                  | Onde está                                                                                    |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Aplicar a abordagem de Linha de Produto de Software     | Núcleo em `src/nucleo/`, variação em `src/nucleo/LinhaProduto.ts` e na tela Linha de produto |
| Mínimo de 2 telas (CRUD) por integrante — 8 no total    | `src/modulos/` (8 módulos) + tela genérica em `public/js/telaCrud.js`                        |
| Conexão com o banco de dados                            | MySQL via `mysql2`, pool criado pelo Singleton `src/nucleo/ConexaoBanco.ts`                  |
| Criar a partir de 3 tabelas no banco                    | 11 tabelas em `banco/schema.sql`                                                             |
| Exemplo de como planejaram a variabilidade              | Tela **Linha de produto**, que troca o produto e liga/desliga features em tempo de execução  |
| Entrega anterior: Singleton, Template Method e Strategy | `src/nucleo/` (Singletons) e `src/padroes/`                                                  |

---

## Empacotamento para Reuso

O NEXORA foi empacotado em dois níveis com o objetivo de atender tanto ao reuso de componentes quanto à portabilidade da aplicação.

### Artefato 1 — `@nexora/nucleo`

Os principais componentes reutilizáveis do núcleo foram isolados e transformados em um pacote npm. O contrato público do componente está definido em `src/nucleo/indice.ts`. O pacote contém recursos como: conexão com banco de dados; persistência genérica; operações CRUD; validação; tratamento de erros; gerenciamento de features; e resolução de variabilidade da Linha de Produto de Software.

Para gerar o pacote, execute `npm run pacote`. O resultado obtido é `pacote/nexora-nucleo-2.0.0.tgz`. Esse artefato pode ser instalado por outro projeto utilizando o comando `npm install ../Nexora/pacote/nexora-nucleo-2.0.0.tgz`. O reuso foi validado em um projeto separado, que conseguiu instalar e importar funcionalidades do NEXORA sem copiar manualmente o código-fonte.

### Artefato 2 — Aplicação executável

A aplicação completa é compactada utilizando esbuild. O processo utiliza bundle, minificação, tree shaking, Node.js SEA e postject. Para gerar o executável, execute `npm run empacotar`. O processo gera os arquivos `build/nexora.cjs`, `build/nexora.blob` e `build/nexora.exe`.

O executável pode iniciar o NEXORA sem utilizar o comando `node`. Os arquivos estáticos e configurações externas são mantidos ao lado do executável na estrutura de distribuição:

```text
distribuicao/
├── nexora.exe
├── public/
└── .env
```

O banco de dados MySQL continua sendo uma dependência externa da aplicação.

### Geração dos dois artefatos

Os dois processos podem ser executados simultaneamente com o comando `npm run entregar`. Esse comando gera o pacote reutilizável `@nexora/nucleo` e o executável da aplicação NEXORA.

### Métricas do empacotamento

#### Componente reutilizável

- Versão: `2.0.0`
- Tamanho do `.tgz`: `15,5 kB`
- Tamanho descompactado: `47,5 kB`
- Arquivos no pacote: `31`
- Declarações `export` no contrato público: `12`
- Dependências externas diretas: `2`

As dependências externas declaradas pelo componente são `Express` e `mysql2`.

#### Aplicação

- Arquivos TypeScript em `src/`: `55` (Antes) / `1 bundle` (Depois)
- Tamanho de `src/` + `node_modules/`: `44,46 MB` (Antes) / `—` (Depois)
- Bundle da aplicação: `—` (Antes) / `1,30 MB` (Depois)
- Executável: `—` (Antes) / `90,67 MB` (Depois)
- Node.js necessário no destino: `Sim` (Antes) / `Não` (Depois)
- Instalação das dependências npm no destino: `Sim` (Antes) / `Não` (Depois)

O executável é maior que o bundle porque incorpora o runtime do Node.js. Essa escolha aumenta o tamanho do artefato final, mas permite executar a aplicação sem instalar Node.js ou as dependências npm individualmente.

### Validação

Antes do empacotamento, o projeto foi validado com `npm run verificar` e `npm run testar`. O resultado foi de `66/66` verificações aprovadas. Depois da geração do bundle e do executável, os testes foram executados novamente, obtendo novamente `66/66` verificações aprovadas. Isso demonstra que o processo de empacotamento preservou o comportamento original da aplicação.

## 🖥️ As telas do sistema

> Todas as telas têm o mesmo comportamento: formulário de cadastro no topo, busca no cabeçalho e tabela com editar e excluir. Editar traz o registro de volta para o formulário; excluir pede confirmação.

### 👥 Clientes

Empresas e pessoas atendidas. Valida CPF ou CNPJ e e-mail. A busca varre nome, documento e e-mail.
**Campos:** nome, CPF/CNPJ, e-mail, telefone, endereço.

### 🔧 Serviços

Catálogo do que a empresa vende, com preço de tabela, valor da hora e duração estimada. A especialidade escolhida aqui é a mesma exigida do técnico na hora de atender.
**Campos:** serviço, especialidade exigida, preço de tabela, valor da hora, duração.

### 📄 Orçamentos

Propostas enviadas ao cliente. O campo "forma de precificação" corresponde às estratégias do padrão Strategy (preço fixo, por hora, por visita).
**Campos:** cliente, descrição, forma de precificação, valor total, validade, situação.
**Regra:** orçamento aprovado precisa de valor maior que zero.

### 📋 Ordens de serviço

Atendimentos em aberto, em execução e concluídos, ligando cliente, serviço e técnico.
**Campos:** descrição, cliente, serviço, técnico, situação, local.
**Regra:** não dá para agendar, executar ou concluir uma OS sem técnico responsável.

### 👷 Técnicos

Equipe de campo, com especialidade e quantas ordens cada um aguenta em paralelo.
**Campos:** nome, especialidade, telefone, OS simultâneas, disponível.

### 📅 Agenda

Horários reservados na agenda de cada técnico, ligados a uma ordem de serviço.
**Campos:** ordem de serviço, técnico, início, duração, confirmado, observação.
**Regra:** um agendamento não passa de 12 horas.

### 📦 Estoque

Peças e materiais. Quando a quantidade fica abaixo do mínimo, a linha aparece destacada na tabela.
**Campos:** SKU, descrição, quantidade, estoque mínimo, custo unitário.

### 💰 Financeiro

Contas a receber e a pagar, com vencimento e situação.
**Campos:** descrição, tipo, valor, vencimento, situação, forma de pagamento.
**Regra:** ao marcar como pago, a forma de pagamento é obrigatória.

### 🔀 Linha de produto (tela de apoio)

Não é um CRUD: é a demonstração da variabilidade. Mostra os quatro produtos, quais telas cada um entrega, e permite ligar ou desligar as features opcionais. O menu muda na hora.

---

## 👨‍💻 Divisão entre os integrantes

> Cada integrante é dono de dois módulos. O arquivo do módulo declara os campos, as validações e as regras da tela; o núcleo cuida do resto.

| Integrante   | Telas                         | Arquivos                                                 |
| ------------ | ----------------------------- | -------------------------------------------------------- |
| Integrante 1 | Clientes, Serviços            | `src/modulos/clientes/`, `src/modulos/servicos/`         |
| Integrante 2 | Técnicos, Agenda              | `src/modulos/tecnicos/`, `src/modulos/agendamentos/`     |
| Integrante 3 | Orçamentos, Ordens de serviço | `src/modulos/orcamentos/`, `src/modulos/ordens-servico/` |
| Integrante 4 | Estoque, Financeiro           | `src/modulos/estoque/`, `src/modulos/financeiro/`        |

### Como criar ou alterar uma tela

Um módulo é um arquivo só. Exemplo reduzido:

```ts
export const moduloClientes: ModuloCrud = {
  id: "clientes", // vira a rota /api/clientes e o link #/clientes
  titulo: "Clientes",
  tabela: "cliente", // tabela no MySQL
  prefixoId: "CLI", // ids gerados: CLI-0001, CLI-0002…
  feature: "clientes", // qual feature da LPS libera esta tela
  porEmpresa: true, // filtra por empresa (multiempresa)
  ordenarPor: "nome",
  buscarEm: ["nome", "documento", "email"],
  responsavel: "Integrante 1",
  campos: [
    {
      nome: "nome",
      rotulo: "Nome",
      tipo: "texto",
      obrigatorio: true,
      listar: true,
    },
    {
      nome: "documento",
      rotulo: "CPF ou CNPJ",
      tipo: "texto",
      obrigatorio: true,
      listar: true,
      validar: Validacoes.documento,
    },
  ],
  validarRegistro: (dados) => null, // regra que envolve mais de um campo
};
```

Depois é só registrar o módulo em `src/modulos/index.ts` e criar a tabela no `banco/schema.sql`. A tela, a API e o SQL saem prontos.

Tipos de campo disponíveis: `texto`, `textolongo`, `email`, `telefone`, `numero`, `moeda`, `data`, `datahora`, `booleano`, `selecao` (lista fixa) e `referencia` (chave estrangeira para outro módulo).

---

## 🗄️ Banco de dados

> 11 tabelas em `banco/schema.sql`, todas InnoDB com chaves estrangeiras. Diagrama e decisões de modelagem em [`banco/MODELO.md`](banco/MODELO.md); consultas prontas para mostrar na apresentação em [`banco/consultas-demo.sql`](banco/consultas-demo.sql).

| Tabela                  | Para que serve                                                    |
| ----------------------- | ----------------------------------------------------------------- |
| `empresa`               | Tenant e o produto contratado da linha (CORE, TECH, MAINT, FIELD) |
| `empresa_feature`       | Features ligadas ou desligadas por empresa (variabilidade)        |
| `cliente`               | Tela Clientes                                                     |
| `servico`               | Tela Serviços                                                     |
| `tecnico`               | Tela Técnicos                                                     |
| `orcamento`             | Tela Orçamentos                                                   |
| `ordem_servico`         | Tela Ordens de serviço                                            |
| `agendamento`           | Tela Agenda                                                       |
| `item_estoque`          | Tela Estoque                                                      |
| `movimentacao_estoque`  | Rastreabilidade das baixas de material, ligada ao item e à OS     |
| `lancamento_financeiro` | Tela Financeiro, com vínculo opcional à OS que gerou a cobrança   |

Dados de demonstração: duas empresas. **EMP-1** (ClimaTec, NEXORA Field) tem registros em todas as telas; **EMP-2** (Ártico, NEXORA Core) tem só o núcleo, para mostrar multiempresa e variabilidade.

**Garantias do banco e do núcleo:**

- Todos os comandos usam parâmetros (`?`), o que evita SQL injection.
- Os ids são gerados no servidor, nunca vêm da tela.
- Toda leitura, alteração e exclusão confere a empresa: uma empresa não enxerga nem altera dados de outra, mesmo digitando o id na URL.
- Erros do MySQL viram mensagens de usuário: CPF/CNPJ ou SKU repetido e exclusão de registro em uso respondem 409; referência inexistente responde 400 (`src/nucleo/errosBanco.ts`).

---

## 🔀 Como a variabilidade foi planejada

> O NEXORA tem um **núcleo obrigatório**, presente em qualquer produto, e **pontos de variação** que mudam de cliente para cliente.

```
                    NEXORA (núcleo)
     Clientes · Serviços · Ordens de serviço · Financeiro
                          |
      +-------------+-----+-------+--------------+
      |             |             |              |
   NEXORA Core   NEXORA Tech  NEXORA Maint   NEXORA Field
   só o núcleo   + Orçamentos + Técnicos     + Orçamentos
                 + Estoque    + Agenda       + Técnicos
                                             + Agenda
                                             + Estoque
```

**Onde isso está no código:**

| Elemento                                                              | Arquivo                                                                               |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Modelo de variabilidade (features obrigatórias, opcionais e produtos) | `src/nucleo/LinhaProduto.ts`                                                          |
| Resolução em tempo de execução                                        | `ResolvedorVariabilidade.featuresAtivas()`                                            |
| Porta de variabilidade na API                                         | `src/nucleo/ControladorCrud.ts` (responde 403 quando a tela não faz parte do produto) |
| Reflexo na interface                                                  | `public/js/app.js` monta o menu a partir de `/api/modulos`                            |
| Tela de configuração                                                  | `public/js/telaVariabilidade.js`                                                      |

**Como demonstrar na apresentação:** abra a tela Linha de produto, troque de NEXORA Field para NEXORA Core e volte ao menu. Estoque, Agenda, Técnicos e Orçamentos somem. Tente acessar `/api/estoque` direto pela URL: a API responde 403. Ligue a feature "estoque" individualmente e a tela volta, sem recompilar nada.

A ligação é **em tempo de execução**, não de compilação: o mesmo binário atende os quatro produtos, e a escolha de cada empresa fica gravada em `empresa_feature`.

---

## 🧩 Padrões de projeto

> Os três padrões continuam no projeto e conversam com o sistema web. Rode `npm run demo` para ver os três funcionando no console, sem precisar de banco.

| Padrão              | Exemplos                                                                 | Pasta                          |
| ------------------- | ------------------------------------------------------------------------ | ------------------------------ |
| **Singleton**       | `ConexaoBanco` (pool MySQL usado por todo o sistema), `RegistroFeatures` | `src/nucleo/`                  |
| **Template Method** | `FinalizacaoOS`, `GeradorRelatorio`, `ImportadorDados`                   | `src/padroes/template-method/` |
| **Strategy**        | `CalculoPrecoServico`, `DistribuicaoTecnico`, `FormaPagamento`           | `src/padroes/strategy/`        |

---

## 📁 Estrutura de pastas

```
nexora-erp/
├── banco/
│   ├── schema.sql                 11 tabelas + dados de exemplo
│   ├── MODELO.md                  diagrama do banco e decisões
│   └── consultas-demo.sql         consultas para a apresentação
├── docs/
│   ├── GUIA-DE-INSTALACAO.md      passo a passo do ambiente (Windows)
│   └── ARQUITETURA.md             visão da arquitetura e decisões
├── public/                        front-end (sem framework)
│   ├── index.html                 casca da aplicação
│   ├── css/nexora.css             design system NEXORA
│   └── js/
│       ├── app.js                 roteador e menu
│       ├── api.js                 acesso à API
│       ├── formato.js             moeda, data, escape
│       ├── telaCrud.js            tela CRUD genérica (core asset)
│       └── telaVariabilidade.js   tela Linha de produto
├── src/
│   ├── api/servidor.ts            Express: rotas, saúde e tratamento de erros
│   ├── nucleo/                    CORE ASSETS da linha de produto
│   │   ├── ConexaoBanco.ts        Singleton do pool MySQL
│   │   ├── RegistroFeatures.ts    Singleton de features
│   │   ├── LinhaProduto.ts        modelo de variabilidade (fonte única)
│   │   ├── RepositorioBase.ts     CRUD genérico em SQL
│   │   ├── ControladorCrud.ts     rotas REST genéricas
│   │   ├── errosBanco.ts          erros do MySQL → mensagem de usuário
│   │   ├── validacao.ts           validações reutilizáveis
│   │   └── tipos.ts               contrato de um módulo
│   ├── modulos/                   as 8 telas, 2 por integrante
│   ├── dominio/                   10 classes de domínio (entrega 1)
│   ├── padroes/                   Template Method e Strategy
│   ├── util/formatacao.ts
│   └── Aplicacao.ts               demonstração dos padrões no console
├── testes/testar-api.mjs          teste automático das 8 telas
├── docker-compose.yml             MySQL 8 + Adminer
├── .env.example                   modelo de configuração
└── tsconfig.json                  configuração do TypeScript
```

---

## ⚠️ Problemas comuns

**`ECONNREFUSED 127.0.0.1:3306`** — o MySQL não está rodando, ou está em outra porta. Abra o Docker Desktop, rode `npm run banco:subir` e espere uns 20 segundos.

**`port is already allocated` ao subir o Docker** — já existe um MySQL (XAMPP, por exemplo) usando a porta 3306. Desligue o outro ou troque para `"3307:3306"` no `docker-compose.yml` e rode com `DB_PORT=3307`.

**Mudei o `schema.sql` e nada mudou no banco** — o Docker só executa o script na primeira subida. Rode `npm run banco:resetar` para recriar do zero.

**`Access denied for user 'nexora'`** — senha diferente no `.env` ou volume antigo do Docker. Confira o `.env` ou rode `npm run banco:resetar`.

**`Unknown database 'nexora'`** — o banco não foi criado. Com Docker, rode `npm run banco:resetar`; sem Docker, rode o `banco/schema.sql`.

**A tela abre mas o menu vem vazio** — a API não respondeu. Abra http://localhost:3000/api/saude e olhe o terminal do `npm start`.

**Acentos aparecem errados** — o banco precisa estar em `utf8mb4`. O `schema.sql` já cria assim; se você criou o banco na mão, recrie com o script.

**Uma tela some do menu** — ela não faz parte do produto contratado. Vá em Linha de produto e habilite a feature.

Mais problemas e soluções no [Guia de instalação](docs/GUIA-DE-INSTALACAO.md#10-problemas-comuns).
