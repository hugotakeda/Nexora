# Changelog

Todas as alterações relevantes do pacote reutilizável do NEXORA serão registradas neste arquivo.

## [2.0.0] - 2026-10

### Adicionado

- Empacotamento do núcleo do NEXORA como pacote npm.
- API pública definida em `src/nucleo/indice.ts`.
- Geração de arquivos de declaração TypeScript `.d.ts`.
- Documentação para instalação e utilização do componente.
- Metadados de versão, dependências e compatibilidade.

### Modificado

- `RegistroFeatures` deixou de depender diretamente da classe `Empresa`.
- O núcleo passou a utilizar um contrato mínimo para permitir maior isolamento e reuso.

### Objetivo

Permitir que funcionalidades do núcleo do NEXORA sejam instaladas e reutilizadas por outros projetos sem necessidade de copiar arquivos manualmente.
