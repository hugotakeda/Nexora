# Modelo do banco — NEXORA

11 tabelas (MySQL 8, InnoDB, utf8mb4). O script completo está em [`schema.sql`](schema.sql); consultas prontas para a apresentação em [`consultas-demo.sql`](consultas-demo.sql).

```mermaid
erDiagram
    empresa ||--o{ empresa_feature : "ajusta features"
    empresa ||--o{ cliente : possui
    empresa ||--o{ servico : vende
    empresa ||--o{ tecnico : emprega
    empresa ||--o{ orcamento : emite
    empresa ||--o{ ordem_servico : executa
    empresa ||--o{ agendamento : agenda
    empresa ||--o{ item_estoque : estoca
    empresa ||--o{ lancamento_financeiro : lanca
    cliente ||--o{ orcamento : recebe
    cliente ||--o{ ordem_servico : solicita
    servico ||--o{ ordem_servico : "é executado em"
    tecnico |o--o{ ordem_servico : "é responsável por"
    ordem_servico ||--o{ agendamento : "é agendada em"
    tecnico ||--o{ agendamento : atende
    item_estoque |o--o{ movimentacao_estoque : movimenta
    ordem_servico |o--o{ movimentacao_estoque : consome
    ordem_servico |o--o{ lancamento_financeiro : gera

    empresa {
        varchar id PK
        varchar razao_social
        varchar cnpj UK
        enum linha_produto "CORE | TECH | MAINT | FIELD"
        boolean ativa
    }
    empresa_feature {
        varchar empresa_id PK,FK
        varchar feature PK
        boolean habilitada
    }
    cliente {
        varchar id PK
        varchar empresa_id FK
        varchar nome
        varchar documento "UK por empresa"
        varchar email
        varchar telefone
        varchar endereco
    }
    servico {
        varchar id PK
        varchar empresa_id FK
        varchar descricao
        varchar categoria
        decimal preco_base
        decimal valor_hora
        decimal duracao_horas
    }
    tecnico {
        varchar id PK
        varchar empresa_id FK
        varchar nome
        varchar especialidade
        int capacidade_maxima
        boolean disponivel
    }
    orcamento {
        varchar id PK
        varchar empresa_id FK
        varchar cliente_id FK
        enum estrategia_preco "Strategy"
        decimal valor_total
        enum status
    }
    ordem_servico {
        varchar id PK
        varchar empresa_id FK
        varchar cliente_id FK
        varchar servico_id FK
        varchar tecnico_id FK "opcional"
        enum status
    }
    agendamento {
        varchar id PK
        varchar ordem_id FK
        varchar tecnico_id FK
        datetime inicio
        decimal duracao_horas
    }
    item_estoque {
        varchar id PK
        varchar empresa_id FK
        varchar sku "UK por empresa"
        int quantidade
        int estoque_minimo
    }
    movimentacao_estoque {
        varchar id PK
        varchar item_id FK
        varchar ordem_id FK
        enum tipo "ENTRADA | SAIDA"
        int qtd
    }
    lancamento_financeiro {
        varchar id PK
        varchar empresa_id FK
        varchar ordem_id FK
        enum tipo "RECEITA | DESPESA"
        decimal valor
        enum forma_pagamento "Strategy"
    }
```

## Decisões que valem ser citadas na defesa

| Decisão | Por quê |
|---|---|
| `empresa_id` em toda tabela de negócio | Multiempresa (SaaS): o mesmo banco atende várias empresas, e o `RepositorioBase` filtra por empresa em toda leitura, alteração e exclusão. |
| `empresa.linha_produto` + `empresa_feature` | A **variabilidade da LPS mora no banco**: o produto contratado define as features padrão e a tabela de ajustes liga/desliga features opcionais sem recompilar. |
| `UNIQUE (empresa_id, documento)` e `UNIQUE (empresa_id, sku)` | O mesmo CPF/CNPJ pode ser cliente de duas empresas diferentes, mas não duas vezes na mesma. Violação vira 409 com mensagem amigável. |
| Chaves estrangeiras sem `CASCADE` nas telas | Excluir um cliente que tem OS é bloqueado (409) em vez de apagar histórico em cascata. |
| `tecnico_id` opcional na OS | A OS nasce "aberta" sem técnico; a regra "não agenda sem técnico" fica no módulo (camada de negócio), não no banco. |
| `estrategia_preco` e `forma_pagamento` como ENUM | Os valores espelham as classes do padrão Strategy (`PrecoFixo`, `PrecoPorHora`, `PrecoPorVisita`; `PagamentoPix`, `PagamentoBoleto`, `PagamentoCartao`). |
| `CHECK` em valores e quantidades | Última barreira contra preço zero ou estoque negativo, mesmo que alguém grave direto no banco. |
| Ids no formato `CLI-0001` gerados no servidor | Legíveis na apresentação e nunca aceitos do navegador. |
