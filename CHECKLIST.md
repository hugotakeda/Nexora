# Checklist geral — NEXORA

Versão 2.0 — atualizado em 21/09/2026. Projeto só em TypeScript. Legenda: `[x]` feito e verificado · `[ ]` pendente · **(equipe)** depende de vocês, não de código.

---

## 1. Entrega 1 — Design Patterns para reuso (Opção 01)

- [x] Ao menos 10 classes principais com atributos e métodos — `src/dominio/` (10 classes)
- [x] Singleton, 2 exemplos — `ConexaoBanco` (pool MySQL real do sistema) e `RegistroFeatures`
- [x] Template Method, 3 exemplos — `FinalizacaoOS`, `GeradorRelatorio`, `ImportadorDados`
- [x] Novo padrão, 3 exemplos — Strategy: `CalculoPrecoServico`, `DistribuicaoTecnico`, `FormaPagamento`
- [x] Demonstração roda sem banco — `npm run demo`
- [x] Versão Java removida (ADR-01 em `docs/ARQUITETURA.md`): uma linguagem só, os padrões são os mesmos usados pelo sistema web
- [x] `RegistroFeatures` e `LinhaProduto.ts` unificados: antes cada um tinha uma lista diferente de features para o mesmo produto (ADR-03)

## 2. Entrega 2 — Linha de Produto de Software (etapa atual)

| Exigência do enunciado | Situação | Onde |
|---|---|---|
| Mínimo de 2 telas CRUD por integrante (8) | [x] 8 telas, CRUD completo testado | `src/modulos/` + `public/js/telaCrud.js` |
| Conexão com o banco de dados | [x] MySQL 8 via Singleton `ConexaoBanco` | `src/nucleo/ConexaoBanco.ts` |
| A partir de 3 tabelas no banco | [x] 11 tabelas com FKs, UNIQUE e CHECK | `banco/schema.sql`, `banco/MODELO.md` |
| Exemplo de como planejaram a variabilidade | [x] 4 produtos (Core, Tech, Maint, Field), troca em tempo de execução | Tela **Linha de produto**, `src/nucleo/LinhaProduto.ts` |

### Banco de dados

- [x] `docker-compose.yml` com MySQL 8 + Adminer — sobe e cria tudo com `npm run banco:subir`
- [x] Schema v2: `movimentacao_estoque` ligada a empresa, item e OS; `lancamento_financeiro` ligado à OS e com `valor_pago` (usado pelo Strategy de pagamento); `CHECK` em preços e quantidades
- [x] Dados de demonstração nas 8 telas + segunda empresa (EMP-2, NEXORA Core) para mostrar multiempresa
- [x] Diagrama ER e justificativas de modelagem — `banco/MODELO.md`
- [x] 7 consultas prontas para mostrar na defesa (JOINs, estoque crítico, variabilidade) — `banco/consultas-demo.sql`

### Correções e melhorias no núcleo

- [x] Erros do MySQL voltavam como página HTML com stack trace; agora viram mensagem de usuário (409 para duplicado ou registro em uso, 400 para referência inexistente) — `src/nucleo/errosBanco.ts`
- [x] Editar, excluir e buscar por id não conferiam a empresa (uma empresa podia mexer em dado de outra pela URL); agora conferem — `RepositorioBase.filtroId`
- [x] Arquivo `.env` agora é lido de verdade ao iniciar (antes era só documentado) e há `GET /api/saude` para diagnóstico
- [x] Versões fixadas: `package-lock.json` (`npm ci`), `engines` no `package.json` e `.nvmrc` (Node 24 LTS); `npm audit` sem vulnerabilidades
- [x] Teste automático: `npm run testar` → **66/66 verificações** (CRUD das 8 telas, regras de negócio, isolamento entre empresas, troca de produto e 403 de feature desligada)

### Pendências da equipe

- [ ] **(equipe)** Trocar "Integrante 1…4" pelos nomes reais: tabela da seção 4 do `README.md` e campo `responsavel` de cada `*.modulo.ts`
- [ ] **(equipe)** Cada integrante seguir o `docs/GUIA-DE-INSTALACAO.md` e marcar o checklist da seção 13 no próprio PC
- [ ] **(equipe)** Colocar o projeto num repositório Git compartilhado (GitHub) — `.gitignore` e `.gitattributes` já estão prontos
- [ ] **(equipe)** Confirmar com o prof. Tiago que variabilidade resolvida **em tempo de execução** (feature toggles + tabela `empresa_feature`) é aceita, ou se ele espera ligação em tempo de compilação
- [ ] Opcional: exibir as situações com acento e espaço na tabela ("Em execução" em vez de "em execucao")

## 3. Preparação para a defesa (sorteada — todos precisam saber tudo)

- [ ] **(equipe)** Cada um consegue explicar o caminho de um clique até o banco: `telaCrud.js` → `api.js` → `ControladorCrud` → `validacao.ts` → `RepositorioBase` → `ConexaoBanco` → MySQL
- [ ] **(equipe)** Cada um sabe abrir qualquer `*.modulo.ts` e explicar campos, validações e a regra de negócio da tela
- [ ] **(equipe)** Ensaiar a demo de variabilidade: Field → Core (4 telas somem) → `/api/estoque` responde 403 → ligar só "estoque" → tela volta sem recompilar
- [ ] **(equipe)** Ensaiar a demo multiempresa: `EMPRESA_ID=EMP-2 npm start` mostra outra empresa, outro produto, outros dados
- [ ] **(equipe)** Ensaiar mostrar o banco no Adminer (http://localhost:8080) e rodar 2 ou 3 consultas de `consultas-demo.sql`

**Perguntas prováveis e onde está a resposta**

| Pergunta | Resposta curta | Arquivo |
|---|---|---|
| Onde está o reuso? | As 8 telas não têm controller, repositório nem HTML próprios; cada uma é uma declaração de dados que o núcleo transforma em CRUD | `src/nucleo/`, `src/modulos/` |
| O que é core asset aqui? | `RepositorioBase`, `ControladorCrud`, `telaCrud.js`, `validacao.ts`, `errosBanco.ts`, `ConexaoBanco` | `src/nucleo/` |
| Como a variabilidade é resolvida? | Em tempo de execução: produto da empresa + ajustes em `empresa_feature`, lidos pelo `ResolvedorVariabilidade` | `LinhaProduto.ts` |
| Como adicionar uma tela nova? | Um arquivo `.modulo.ts`, registrar no `index.ts`, criar a tabela | `CLAUDE.md` |
| Por que Singleton na conexão? | Um único pool para o sistema inteiro; o log "Instância criada" aparece uma vez só | `ConexaoBanco.ts` |
| E se excluir um cliente com OS? | O banco bloqueia pela FK e a tela explica o motivo (409) | `errosBanco.ts` |
| Como evitam SQL injection? | Todo SQL usa `?`; nomes de tabela/coluna vêm dos módulos, nunca da tela | `RepositorioBase.ts` |

## 4. Projeto como um todo (duas disciplinas)

**Desenvolvimento Orientado a Reúso**

- [x] Proposta de LPS: NEXORA Core → Tech / Maint / Field
- [x] 6 ativos reutilizáveis definidos (Autenticação, Clientes, OS, Agenda, Estoque, Financeiro)
- [x] Protótipo de alta fidelidade da fase 1 com 4 organizações derivadas — pasta `Nexora/` (HTML + localStorage)
- [x] Entrega 1 (padrões) e Entrega 2 (LPS com banco)
- [x] Documentação de arquitetura com decisões registradas — `docs/ARQUITETURA.md`
- [ ] Próximas aulas: aplicar as técnicas de LPS que o professor passar sobre este código (feature model, rastreabilidade feature → código, novo produto derivado)

**Medição e Análise de Processos e Produtos** — confirmem o que já foi entregue

- [ ] 15 requisitos funcionais e 10 não funcionais
- [ ] 6 personas, mapa de empatia e público-alvo
- [ ] Storyboard de 10 a 15 interações
- [ ] Protótipo de 10 a 15 telas com CRUD (o protótipo da pasta `Nexora/` provavelmente cobre)
- [ ] Contagem de pontos de função (APF) e estimativas — as 8 telas CRUD e as 11 tabelas agora dão base concreta para contar ALI/AIE e EE/CE/SE

**Pendências de consistência**

- [ ] Máquina de estados da OS: o sistema usa 5 situações (Aberta, Agendada, Em execução, Concluída, Cancelada); conferir se o documento mestre e o RF10 dizem o mesmo
- [ ] Documento mestre: registrar a stack final (TypeScript + Express + MySQL em Docker, sem Java) no lugar da recomendação antiga (NestJS + PostgreSQL)
