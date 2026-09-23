# Guia de instalação e execução — NEXORA 2.0

Passo a passo para deixar qualquer computador da equipe pronto para rodar, testar e apresentar o NEXORA. Escrito para **Windows 10/11** (a maioria da equipe); há notas para macOS e Linux no fim.

Tempo estimado na primeira vez: **30 a 45 minutos**, a maior parte esperando downloads. Depois disso, subir o projeto leva menos de 1 minuto.

---

## Sumário

1. [Resumo rápido](#1-resumo-rápido)
2. [O que você vai instalar](#2-o-que-você-vai-instalar)
3. [Conferir o computador](#3-conferir-o-computador)
4. [Instalar o Node.js](#4-instalar-o-nodejs)
5. [Instalar o WSL 2 e o Docker Desktop](#5-instalar-o-wsl-2-e-o-docker-desktop)
6. [Instalar o VS Code e o Git](#6-instalar-o-vs-code-e-o-git)
7. [Colocar o projeto na máquina](#7-colocar-o-projeto-na-máquina)
8. [Rodar o projeto pela primeira vez](#8-rodar-o-projeto-pela-primeira-vez)
9. [Uso no dia a dia](#9-uso-no-dia-a-dia)
10. [Problemas comuns](#10-problemas-comuns)
11. [Plano B: sem Docker (XAMPP)](#11-plano-b-sem-docker-xampp)
12. [macOS e Linux](#12-macos-e-linux)
13. [Checklist do ambiente pronto](#13-checklist-do-ambiente-pronto)

---

## 1. Resumo rápido

Se você já tem **Node.js 24** e **Docker Desktop** funcionando, é só isto, dentro da pasta do projeto:

```powershell
npm ci                 # instala exatamente as versões do package-lock.json
npm run banco:subir    # sobe MySQL 8 + Adminer; na 1ª vez cria tabelas e dados
npm start              # http://localhost:3000
```

Em outro terminal, para conferir:

```powershell
npm run testar         # tem que terminar com "66/66 verificações passaram."
```

Se algo disso é novidade, siga o guia a partir da seção 2.

---

## 2. O que você vai instalar

| Ferramenta | Versão | Para que serve no projeto | Obrigatória? |
|---|---|---|---|
| **Node.js** (inclui o npm) | 24 LTS (mínimo 20.12) | Roda o servidor TypeScript e o front | Sim |
| **WSL 2** | 2.1.5 ou superior | Subsistema Linux do Windows; o Docker roda em cima dele | Sim (no Windows) |
| **Docker Desktop** | atual | Roda o MySQL 8 e o Adminer em containers | Sim* |
| **VS Code** | atual | Editor recomendado | Recomendado |
| **Git** | atual | Versionar e compartilhar o código entre a equipe | Recomendado |

\* Se o seu computador não aceitar Docker, use o [Plano B com XAMPP](#11-plano-b-sem-docker-xampp).

O que **não** precisa instalar: TypeScript, Express, driver do MySQL. Tudo isso vem pelo `npm ci`, dentro da pasta do projeto, na versão certa. Também não precisa instalar MySQL no Windows: ele roda dentro do Docker.

> **Sobre a licença do Docker Desktop:** o uso é gratuito para uso pessoal, educacional e empresas pequenas; a assinatura paga só é exigida de empresas com mais de 250 funcionários ou mais de US$ 10 milhões de faturamento anual.

---

## 3. Conferir o computador

O Docker Desktop no Windows exige:

| Requisito | Mínimo | Como conferir |
|---|---|---|
| Windows | Windows 10 22H2 (build 19045) ou Windows 11 23H2 (build 22631) | Tecla `Win + R` → digite `winver` → Enter |
| Memória | 8 GB de RAM | Configurações → Sistema → Sobre |
| Virtualização | Ligada na BIOS/UEFI | Gerenciador de Tarefas → aba Desempenho → CPU → "Virtualização: Habilitado" |

**Se a virtualização aparecer "Desabilitado":** reinicie o PC, entre na BIOS (geralmente `F2`, `F10`, `Del` ou `Esc` logo ao ligar) e ative a opção chamada *Intel Virtualization Technology (VT-x)* ou *SVM Mode* (AMD). Salve e reinicie. Sem isso o Docker não funciona.

---

## 4. Instalar o Node.js

### Opção A — pelo terminal (recomendado)

Abra o **PowerShell** (menu Iniciar → digite "PowerShell") e rode:

```powershell
winget install OpenJS.NodeJS.LTS
```

### Opção B — pelo site

Baixe o instalador **LTS** em https://nodejs.org e aceite as opções padrão. Não precisa marcar "Tools for Native Modules".

### Conferir

**Feche e abra o terminal de novo** (o terminal antigo não enxerga programas recém-instalados) e rode:

```powershell
node -v    # esperado: v24.x.x
npm -v     # esperado: 10.x ou 11.x
```

### Liberar scripts do npm no PowerShell (faça uma vez)

No Windows, o PowerShell bloqueia scripts por padrão e o `npm` falha com *"npm.ps1 cannot be loaded because running scripts is disabled"*. Libere só para o seu usuário:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Responda `S` (ou `Y`) se perguntar.

> **Já tem outra versão do Node por causa de outra matéria?** Use o `nvm-windows` (https://github.com/coreybutler/nvm-windows) para ter várias versões lado a lado: `nvm install 24` e `nvm use 24`. O projeto tem um arquivo `.nvmrc` indicando a versão 24.

---

## 5. Instalar o WSL 2 e o Docker Desktop

### 5.1 WSL 2

Abra o **PowerShell como administrador** (botão direito → "Executar como administrador"):

```powershell
wsl --install
```

Reinicie o computador quando pedir. Depois, num PowerShell comum:

```powershell
wsl --update
wsl --version     # "Versão do WSL" precisa ser 2.1.5 ou maior
```

Se o `wsl --install` abrir um Ubuntu pedindo usuário e senha, pode criar qualquer um; o projeto não usa esse Ubuntu diretamente.

### 5.2 Docker Desktop

```powershell
winget install Docker.DockerDesktop
```

(ou baixe em https://www.docker.com/products/docker-desktop)

Durante a instalação, deixe marcada a opção **"Use WSL 2 instead of Hyper-V"**. Ao terminar:

1. Abra o **Docker Desktop** pelo menu Iniciar.
2. Aceite os termos. Não é obrigatório criar conta: clique em *Skip* / *Continue without signing in*.
3. Espere o ícone da baleia, perto do relógio, parar de animar. No canto inferior esquerdo do Docker Desktop deve aparecer **"Engine running"**.

### Conferir

```powershell
docker version            # tem que mostrar "Client" E "Server"
docker compose version    # v2.x
docker run --rm hello-world
```

O último comando baixa uma imagem minúscula e imprime *"Hello from Docker!"*. Se isso funcionou, o Docker está pronto.

> **Importante:** o Docker Desktop precisa estar **aberto** sempre que você for usar o projeto. Se quiser, em Settings → General marque *"Start Docker Desktop when you sign in"*.

---

## 6. Instalar o VS Code e o Git

```powershell
winget install Microsoft.VisualStudioCode
winget install Git.Git
```

Extensões do VS Code que ajudam neste projeto (Ctrl+Shift+X e pesquise pelo nome):

| Extensão | Para quê |
|---|---|
| **Container Tools** ou **Docker** (Microsoft) | Ver e controlar os containers do MySQL e do Adminer |
| **Markdown Preview Mermaid Support** | Ver os diagramas do `banco/MODELO.md` e do `docs/ARQUITETURA.md` |
| **Error Lens** (opcional) | Mostra os erros do TypeScript na própria linha |

Configure o Git uma vez com seu nome:

```powershell
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@pucpr.edu.br"
```

---

## 7. Colocar o projeto na máquina

**Pelo zip:** extraia o `nexora-erp.zip` numa pasta **fora do OneDrive**, por exemplo `C:\dev\nexora-erp`.

> **Por que fora do OneDrive?** O `npm ci` cria milhares de arquivos em `node_modules`. O OneDrive tenta sincronizar todos, deixa tudo lento e às vezes trava arquivos no meio da instalação (erro `EPERM` ou `EBUSY`). Área de Trabalho e Documentos costumam estar dentro do OneDrive.

**Pelo Git** (quando a equipe criar o repositório):

```powershell
cd C:\dev
git clone <url-do-repositorio> nexora-erp
```

Abra a pasta no VS Code: `code C:\dev\nexora-erp` (ou Arquivo → Abrir Pasta). Use o terminal integrado do VS Code (`Ctrl + '`): ele já abre na pasta do projeto.

A pasta deve ter esta cara:

```
nexora-erp/
├── banco/            schema.sql, MODELO.md, consultas-demo.sql
├── docs/             este guia e a arquitetura
├── public/           telas (HTML, CSS, JS)
├── src/              código TypeScript
├── testes/           teste automático
├── docker-compose.yml
├── package.json
└── README.md
```

---

## 8. Rodar o projeto pela primeira vez

Todos os comandos abaixo são executados **dentro da pasta `nexora-erp`**.

### Passo 1 — Instalar as dependências

```powershell
npm ci
```

Cria a pasta `node_modules` com TypeScript, Express e o driver do MySQL, nas versões exatas do `package-lock.json`. Deve terminar com *"found 0 vulnerabilities"*.

### Passo 2 — Subir o banco

Com o Docker Desktop aberto:

```powershell
npm run banco:subir
```

Na **primeira vez** o Docker baixa as imagens do MySQL 8 e do Adminer (cerca de 700 MB; depende da sua internet). Depois ele cria o banco `nexora`, as 11 tabelas, o usuário `nexora` e os dados de demonstração, tudo sozinho.

Espere o MySQL ficar pronto (20 a 40 segundos na primeira vez):

```powershell
docker compose ps
```

Continue quando a coluna STATUS do `nexora-mysql` mostrar **`(healthy)`**.

### Passo 3 — Configuração (opcional)

Com Docker, os valores padrão já funcionam e **você pode pular este passo**. Se precisar mudar porta, senha ou empresa:

```powershell
Copy-Item .env.example .env
code .env
```

O servidor lê o `.env` sozinho ao iniciar. O `.env` não vai para o Git (está no `.gitignore`).

### Passo 4 — Subir o sistema

```powershell
npm start
```

A saída esperada é parecida com esta:

```
[ConexaoBanco] >>> Instância criada (esta mensagem deve aparecer UMA vez)
[ConexaoBanco] Pool criado para mysql://localhost:3306/nexora
[API] Banco de dados respondeu.
[API] NEXORA em http://localhost:3000
[API] 8 módulos CRUD carregados: clientes, servicos, orcamentos, ordens-servico, tecnicos, agendamentos, estoque, financeiro
```

Abra **http://localhost:3000** no navegador. O menu da esquerda deve mostrar as 8 telas, com dados.

Deixe esse terminal aberto: fechar o terminal desliga o sistema. Para parar, use `Ctrl + C`.

### Passo 5 — Conferir que está tudo certo

Abra **um segundo terminal** (no VS Code, o botão `+` do painel de terminal) e rode:

```powershell
npm run testar
```

Tem que terminar com:

```
66/66 verificações passaram.
```

Você também pode abrir http://localhost:3000/api/saude. O esperado é:

```json
{ "aplicacao": "ok", "banco": "ok", "empresa": "EMP-1" }
```

Se chegou aqui, **o ambiente está pronto**.

---

## 9. Uso no dia a dia

### Rotina normal

```powershell
# 1. Abrir o Docker Desktop (se não abre sozinho)
npm run banco:subir    # se o container já existe, só religa (os dados continuam lá)
npm start
# ... trabalhar ...
# Ctrl + C para parar o sistema
npm run banco:parar    # opcional: desliga o MySQL e libera memória
```

### Todos os comandos

| Comando | O que faz |
|---|---|
| `npm start` | Compila o TypeScript e sobe o sistema em http://localhost:3000 |
| `npm run testar` | Teste automático das 8 telas, regras e variabilidade (com o sistema rodando) |
| `npm run verificar` | Confere os tipos do TypeScript sem gerar arquivos |
| `npm run demo` | Demonstração dos padrões de projeto no console, sem banco |
| `npm run banco:subir` | Liga o MySQL e o Adminer |
| `npm run banco:parar` | Desliga os containers, mantendo os dados |
| `npm run banco:resetar` | **Apaga tudo** e recria o banco a partir do `schema.sql` |
| `npm run banco:logs` | Mostra o log do MySQL (Ctrl + C para sair) |

### Ver o banco pelo navegador (Adminer)

Abra **http://localhost:8080** e preencha:

| Campo | Valor |
|---|---|
| Sistema | MySQL / MariaDB |
| Servidor | `mysql` |
| Usuário | `nexora` |
| Senha | `nexora` |
| Base de dados | `nexora` |

Para rodar as consultas da apresentação: menu **Comando SQL** → cole o conteúdo de `banco/consultas-demo.sql` → Executar.

### Ver o banco pelo terminal

```powershell
docker exec -it nexora-mysql mysql -unexora -pnexora nexora
```

Dentro do MySQL: `SHOW TABLES;`, `SELECT * FROM cliente;`, e `exit` para sair.

### Voltar os dados ao estado da demonstração

Antes de apresentar, ou depois de muitos testes:

```powershell
npm run banco:resetar
```

Espere o `(healthy)` no `docker compose ps` e suba o sistema de novo. **Atenção:** esse comando apaga tudo o que foi cadastrado.

### Ver o sistema como outra empresa (demonstração de variabilidade)

```powershell
$env:EMPRESA_ID="EMP-2"; npm start
```

A EMP-2 contratou o **NEXORA Core**: o menu mostra só as 4 telas do núcleo, com os dados dela. Para voltar, feche o terminal e abra outro (ou rode `Remove-Item Env:EMPRESA_ID`).

### Mudei o `schema.sql` e nada mudou

O Docker só executa o `schema.sql` na **primeira** subida do volume. Depois de alterar o arquivo, rode `npm run banco:resetar`.

---

## 10. Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| `npm.ps1 cannot be loaded because running scripts is disabled` | Política de scripts do PowerShell | `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` |
| `'node' não é reconhecido como comando` | Terminal aberto antes da instalação | Feche todos os terminais (e o VS Code) e abra de novo |
| `npm ci` reclama que não há `package-lock.json` | Arquivo apagado ou pasta errada | Confira se está na pasta `nexora-erp`; se o lock sumiu, use `npm install` |
| `EPERM` / `EBUSY` durante o `npm ci` | Pasta dentro do OneDrive ou antivírus travando arquivos | Mova o projeto para `C:\dev\` e rode de novo |
| `error during connect` / `docker: command not found` | Docker Desktop fechado | Abra o Docker Desktop e espere "Engine running" |
| Docker Desktop: *"WSL 2 installation is incomplete"* | WSL desatualizado | `wsl --update` e reinicie o Docker Desktop |
| Docker Desktop: *"Virtualization support not detected"* | Virtualização desligada na BIOS | Veja a [seção 3](#3-conferir-o-computador) |
| `Bind for 0.0.0.0:3306 failed: port is already allocated` | Outro MySQL usando a porta 3306 (XAMPP ou MySQL instalado no Windows) | Feche o MySQL do XAMPP ou pare o serviço: `Get-Service *mysql*` e depois `Stop-Service MySQL80` (PowerShell como administrador). Ou mude a porta, abaixo |
| Porta 8080 ocupada (Adminer) | Outro programa na 8080 | No `docker-compose.yml`, troque `"8080:8080"` por `"8081:8080"` e use http://localhost:8081 |
| `EADDRINUSE: address already in use :::3000` | Outro `npm start` já rodando | Feche o outro terminal, ou `$env:PORT="3001"; npm start` |
| `ECONNREFUSED 127.0.0.1:3306` no `npm start` | MySQL desligado ou ainda iniciando | `npm run banco:subir`, espere o `(healthy)` e tente de novo |
| `Access denied for user 'nexora'` | Volume antigo, criado com outra senha, ou `.env` com senha errada | Confira o `.env`; se não resolver, `npm run banco:resetar` |
| `Unknown database 'nexora'` | O banco não foi criado | `npm run banco:resetar` |
| O menu da tela vem vazio | A API não respondeu | Abra http://localhost:3000/api/saude e leia o terminal do `npm start` |
| Uma tela sumiu do menu | Ela não faz parte do produto contratado | Tela **Linha de produto** → volte para NEXORA Field ou ligue a feature |
| `npm run testar` falha em várias telas | Dados alterados por testes manuais | `npm run banco:resetar`, suba o sistema e rode de novo |
| Acentos aparecem errados no terminal do MySQL | Terminal do Windows em outra codificação | Só visual. Na aplicação e no Adminer aparecem certos |
| `docker compose` baixa as imagens muito devagar | Primeira execução | Normal na primeira vez; das próximas vezes as imagens já estão no PC |

### Trocar a porta do MySQL (convivendo com o XAMPP)

1. No `docker-compose.yml`, troque `"3306:3306"` por `"3307:3306"`.
2. Crie o `.env` (`Copy-Item .env.example .env`) e mude para `DB_PORT=3307`.
3. `npm run banco:parar` e depois `npm run banco:subir`.

### Ainda não resolveu?

Colete isto e mande no grupo da equipe:

```powershell
node -v; npm -v; docker version; docker compose ps
npm run banco:logs     # Ctrl + C depois de alguns segundos
```

E a mensagem completa do terminal do `npm start`.

---

## 11. Plano B: sem Docker (XAMPP)

Use só se o computador não aceitar Docker (virtualização bloqueada, Windows antigo). O XAMPP traz o MariaDB, que é compatível com o `schema.sql`.

1. Instale o XAMPP (https://www.apachefriends.org) e, no painel, clique em **Start** na linha **MySQL**.
2. No PowerShell, dentro da pasta do projeto:

    ```powershell
    cmd /c "C:\xampp\mysql\bin\mysql.exe -u root < banco\schema.sql"
    ```

    > O PowerShell não aceita o `<` para redirecionar arquivos; por isso o comando passa pelo `cmd /c`.

3. Crie o `.env` apontando para o usuário `root` do XAMPP (que não tem senha):

    ```powershell
    Copy-Item .env.example .env
    ```

    Edite o `.env` e deixe:

    ```
    DB_USER=root
    DB_PASSWORD=
    ```

4. `npm start` e `npm run testar`, como na seção 8.

Para ver o banco, use o phpMyAdmin do XAMPP (http://localhost/phpmyadmin) no lugar do Adminer. Para recriar os dados, rode de novo o comando do passo 2 depois de apagar o banco `nexora` no phpMyAdmin.

---

## 12. macOS e Linux

- **Node:** `brew install node@24` (macOS) ou via nvm (`nvm install 24`).
- **Docker:** Docker Desktop no macOS; no Linux, Docker Engine + plugin Compose (`docker compose version` precisa funcionar sem `sudo`, ou adicione seu usuário ao grupo `docker`).
- Os comandos `npm` são os mesmos. Para trocar a empresa: `EMPRESA_ID=EMP-2 npm start`.
- Sem Docker: `mysql -u root -p < banco/schema.sql` funciona direto no terminal.

---

## 13. Checklist do ambiente pronto

Marque na sua máquina antes da defesa:

- [ ] `node -v` mostra v24 (ou no mínimo v20.12)
- [ ] `docker version` mostra Client **e** Server
- [ ] Projeto fora do OneDrive, aberto no VS Code
- [ ] `npm ci` terminou sem erros
- [ ] `docker compose ps` mostra o `nexora-mysql` como `(healthy)`
- [ ] http://localhost:3000 abre com as 8 telas no menu
- [ ] `npm run testar` → 66/66
- [ ] Adminer abre em http://localhost:8080 e mostra as 11 tabelas
- [ ] Sabe rodar `npm run banco:resetar` para voltar os dados ao estado da demonstração
- [ ] Sabe subir como EMP-2 para mostrar a variabilidade
