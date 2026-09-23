-- ============================================================
-- NEXORA — esquema do banco (MySQL 8 / MariaDB 10.6+)  · versão 2
--
-- Com Docker (recomendado):  docker compose up -d
--   → o container executa este arquivo sozinho na primeira subida.
-- Sem Docker:                mysql -u root -p < banco/schema.sql
--
-- 11 tabelas, InnoDB, utf8mb4. Tudo que é "por empresa" leva empresa_id
-- (multiempresa); empresa + empresa_feature guardam a variabilidade da LPS.
-- ============================================================
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS nexora CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nexora;

-- 1. Empresa (tenant) e o produto da Linha de Produto que ela contratou
CREATE TABLE IF NOT EXISTS empresa (
  id            VARCHAR(20)  PRIMARY KEY,
  razao_social  VARCHAR(120) NOT NULL,
  cnpj          VARCHAR(20)  NOT NULL UNIQUE,
  linha_produto ENUM('CORE','TECH','MAINT','FIELD') NOT NULL DEFAULT 'CORE',
  ativa         BOOLEAN      NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- 2. Ajustes de variabilidade por empresa (liga/desliga feature opcional)
CREATE TABLE IF NOT EXISTS empresa_feature (
  empresa_id VARCHAR(20) NOT NULL,
  feature    VARCHAR(40) NOT NULL,
  habilitada BOOLEAN     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (empresa_id, feature),
  CONSTRAINT fk_feature_empresa FOREIGN KEY (empresa_id) REFERENCES empresa (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Clientes
CREATE TABLE IF NOT EXISTS cliente (
  id         VARCHAR(30)  PRIMARY KEY,
  empresa_id VARCHAR(20)  NOT NULL,
  nome       VARCHAR(120) NOT NULL,
  documento  VARCHAR(20)  NOT NULL,
  email      VARCHAR(120) NOT NULL,
  telefone   VARCHAR(20),
  endereco   VARCHAR(200),
  criado_em  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cliente_empresa FOREIGN KEY (empresa_id) REFERENCES empresa (id),
  CONSTRAINT uq_cliente_documento UNIQUE (empresa_id, documento),
  INDEX idx_cliente_nome (nome)
) ENGINE=InnoDB;

-- 4. Catálogo de serviços
CREATE TABLE IF NOT EXISTS servico (
  id            VARCHAR(30)  PRIMARY KEY,
  empresa_id    VARCHAR(20)  NOT NULL,
  descricao     VARCHAR(120) NOT NULL,
  categoria     VARCHAR(40)  NOT NULL,
  preco_base    DECIMAL(10,2) NOT NULL,
  valor_hora    DECIMAL(10,2) NOT NULL,
  duracao_horas DECIMAL(5,2)  NOT NULL,
  criado_em     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_servico_empresa FOREIGN KEY (empresa_id) REFERENCES empresa (id),
  CONSTRAINT ck_servico_valores CHECK (preco_base > 0 AND valor_hora > 0 AND duracao_horas > 0)
) ENGINE=InnoDB;

-- 5. Técnicos
CREATE TABLE IF NOT EXISTS tecnico (
  id                VARCHAR(30)  PRIMARY KEY,
  empresa_id        VARCHAR(20)  NOT NULL,
  nome              VARCHAR(120) NOT NULL,
  especialidade     VARCHAR(40)  NOT NULL,
  telefone          VARCHAR(20),
  capacidade_maxima INT          NOT NULL DEFAULT 3,
  disponivel        BOOLEAN      NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_tecnico_empresa FOREIGN KEY (empresa_id) REFERENCES empresa (id)
) ENGINE=InnoDB;

-- 6. Orçamentos
CREATE TABLE IF NOT EXISTS orcamento (
  id               VARCHAR(30)  PRIMARY KEY,
  empresa_id       VARCHAR(20)  NOT NULL,
  cliente_id       VARCHAR(30)  NOT NULL,
  descricao        VARCHAR(160) NOT NULL,
  estrategia_preco ENUM('PRECO_FIXO','POR_HORA','POR_VISITA') NOT NULL DEFAULT 'PRECO_FIXO',
  valor_total      DECIMAL(10,2) NOT NULL,
  validade_dias    INT          NOT NULL DEFAULT 15,
  status           ENUM('RASCUNHO','ENVIADO','APROVADO','REPROVADO') NOT NULL DEFAULT 'RASCUNHO',
  criado_em        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orcamento_empresa FOREIGN KEY (empresa_id) REFERENCES empresa (id),
  CONSTRAINT fk_orcamento_cliente FOREIGN KEY (cliente_id) REFERENCES cliente (id)
) ENGINE=InnoDB;

-- 7. Ordens de serviço
CREATE TABLE IF NOT EXISTS ordem_servico (
  id         VARCHAR(30)  PRIMARY KEY,
  empresa_id VARCHAR(20)  NOT NULL,
  descricao  VARCHAR(160) NOT NULL,
  cliente_id VARCHAR(30)  NOT NULL,
  servico_id VARCHAR(30)  NOT NULL,
  tecnico_id VARCHAR(30),
  status     ENUM('ABERTA','AGENDADA','EM_EXECUCAO','CONCLUIDA','CANCELADA') NOT NULL DEFAULT 'ABERTA',
  endereco   VARCHAR(200),
  criado_em  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_os_empresa FOREIGN KEY (empresa_id) REFERENCES empresa (id),
  CONSTRAINT fk_os_cliente FOREIGN KEY (cliente_id) REFERENCES cliente (id),
  CONSTRAINT fk_os_servico FOREIGN KEY (servico_id) REFERENCES servico (id),
  CONSTRAINT fk_os_tecnico FOREIGN KEY (tecnico_id) REFERENCES tecnico (id),
  INDEX idx_os_status (status)
) ENGINE=InnoDB;

-- 8. Agenda
CREATE TABLE IF NOT EXISTS agendamento (
  id            VARCHAR(30) PRIMARY KEY,
  empresa_id    VARCHAR(20) NOT NULL,
  ordem_id      VARCHAR(30) NOT NULL,
  tecnico_id    VARCHAR(30) NOT NULL,
  inicio        DATETIME    NOT NULL,
  duracao_horas DECIMAL(5,2) NOT NULL,
  confirmado    BOOLEAN     NOT NULL DEFAULT FALSE,
  observacao    VARCHAR(255),
  CONSTRAINT fk_agenda_empresa FOREIGN KEY (empresa_id) REFERENCES empresa (id),
  CONSTRAINT fk_agenda_ordem FOREIGN KEY (ordem_id) REFERENCES ordem_servico (id),
  CONSTRAINT fk_agenda_tecnico FOREIGN KEY (tecnico_id) REFERENCES tecnico (id),
  INDEX idx_agenda_inicio (inicio)
) ENGINE=InnoDB;

-- 9. Estoque
CREATE TABLE IF NOT EXISTS item_estoque (
  id             VARCHAR(30)  PRIMARY KEY,
  empresa_id     VARCHAR(20)  NOT NULL,
  sku            VARCHAR(40)  NOT NULL,
  descricao      VARCHAR(120) NOT NULL,
  quantidade     INT          NOT NULL DEFAULT 0,
  estoque_minimo INT          NOT NULL DEFAULT 0,
  custo_unitario DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_item_empresa FOREIGN KEY (empresa_id) REFERENCES empresa (id),
  CONSTRAINT ck_item_valores CHECK (quantidade >= 0 AND estoque_minimo >= 0 AND custo_unitario > 0),
  CONSTRAINT uq_item_sku UNIQUE (empresa_id, sku)
) ENGINE=InnoDB;

-- 10. Movimentação de estoque (rastreabilidade das baixas de material).
--     Gravada pelo Template Method de finalização de OS. item_id, ordem_id e
--     empresa_id aceitam NULL para manter compatível o INSERT da demonstração
--     dos padrões, que grava só (id, sku, tipo, qtd).
CREATE TABLE IF NOT EXISTS movimentacao_estoque (
  id         VARCHAR(30) PRIMARY KEY,
  empresa_id VARCHAR(20),
  item_id    VARCHAR(30),
  ordem_id   VARCHAR(30),
  sku        VARCHAR(40) NOT NULL,
  tipo       ENUM('ENTRADA','SAIDA') NOT NULL,
  qtd        INT         NOT NULL,
  criado_em  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mov_empresa FOREIGN KEY (empresa_id) REFERENCES empresa (id),
  CONSTRAINT fk_mov_item    FOREIGN KEY (item_id)    REFERENCES item_estoque (id) ON DELETE SET NULL,
  CONSTRAINT fk_mov_ordem   FOREIGN KEY (ordem_id)   REFERENCES ordem_servico (id) ON DELETE SET NULL,
  CONSTRAINT ck_mov_qtd     CHECK (qtd > 0),
  INDEX idx_mov_sku (sku)
) ENGINE=InnoDB;

-- 11. Financeiro
CREATE TABLE IF NOT EXISTS lancamento_financeiro (
  id              VARCHAR(30)  PRIMARY KEY,
  empresa_id      VARCHAR(20)  NOT NULL,
  descricao       VARCHAR(160) NOT NULL,
  tipo            ENUM('RECEITA','DESPESA') NOT NULL,
  valor           DECIMAL(10,2) NOT NULL,
  vencimento      DATE         NOT NULL,
  status          ENUM('PENDENTE','PAGO','CANCELADO') NOT NULL DEFAULT 'PENDENTE',
  forma_pagamento ENUM('PIX','BOLETO','CARTAO'),
  valor_pago      DECIMAL(10,2) NULL,  -- preenchido pelo Strategy de pagamento (taxas, desconto)
  ordem_id        VARCHAR(30)   NULL,  -- cobrança gerada a partir de uma OS
  CONSTRAINT fk_lancamento_empresa FOREIGN KEY (empresa_id) REFERENCES empresa (id),
  CONSTRAINT fk_lancamento_ordem FOREIGN KEY (ordem_id) REFERENCES ordem_servico (id) ON DELETE SET NULL,
  INDEX idx_lancamento_vencimento (vencimento)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Dados de demonstração
--   EMP-1 · NEXORA Field (produto completo, todas as 8 telas)
--   EMP-2 · NEXORA Core  (só o núcleo) — prova de multiempresa e de
--           variabilidade: suba com EMPRESA_ID=EMP-2 e o menu muda.
-- Os ids seguem o formato que o servidor gera (PREFIXO-0001).
-- ------------------------------------------------------------
INSERT IGNORE INTO empresa (id, razao_social, cnpj, linha_produto) VALUES
  ('EMP-1', 'ClimaTec Serviços Ltda',   '12.345.678/0001-90', 'FIELD'),
  ('EMP-2', 'Ártico Climatização Ltda', '45.678.901/0001-23', 'CORE');

INSERT IGNORE INTO cliente (id, empresa_id, nome, documento, email, telefone, endereco) VALUES
  ('CLI-0001','EMP-1','Padaria Bom Pão','98.765.432/0001-10','contato@bompao.com.br','(41) 99999-0000','Rua XV de Novembro, 100 - Curitiba'),
  ('CLI-0002','EMP-1','Mercado Central','11.222.333/0001-44','compras@central.com','(41) 3333-1111','Av. Sete de Setembro, 50 - Curitiba'),
  ('CLI-0003','EMP-1','Clínica Sorriso','22.333.444/0001-55','adm@clinicasorriso.com.br','(41) 3222-4444','Rua Marechal Deodoro, 300 - Curitiba'),
  ('CLI-0004','EMP-2','Condomínio Solar','33.444.555/0001-66','sindico@condsolar.com.br','(41) 3030-2020','Rua Padre Anchieta, 900 - Curitiba');

INSERT IGNORE INTO servico (id, empresa_id, descricao, categoria, preco_base, valor_hora, duracao_horas) VALUES
  ('SRV-0001','EMP-1','Instalação de ar-condicionado','refrigeracao',450.00,120.00,4.0),
  ('SRV-0002','EMP-1','Manutenção preventiva de ar','refrigeracao',180.00,100.00,1.5),
  ('SRV-0003','EMP-1','Revisão de quadro elétrico','eletrica',300.00,110.00,3.0),
  ('SRV-0004','EMP-2','Limpeza de split','refrigeracao',150.00,90.00,1.0);

INSERT IGNORE INTO tecnico (id, empresa_id, nome, especialidade, telefone, capacidade_maxima, disponivel) VALUES
  ('TEC-0001','EMP-1','Ana Ribeiro','refrigeracao','(41) 98888-1111',3,TRUE),
  ('TEC-0002','EMP-1','Bruno Salles','eletrica','(41) 98888-2222',2,TRUE),
  ('TEC-0003','EMP-1','Carla Mendes','refrigeracao','(41) 98888-3333',2,FALSE);

INSERT IGNORE INTO orcamento (id, empresa_id, cliente_id, descricao, estrategia_preco, valor_total, validade_dias, status) VALUES
  ('ORC-0001','EMP-1','CLI-0001','Instalação de 2 splits na cozinha','PRECO_FIXO',900.00,15,'APROVADO'),
  ('ORC-0002','EMP-1','CLI-0002','Revisão do quadro elétrico da loja','POR_HORA',330.00,10,'ENVIADO'),
  ('ORC-0003','EMP-1','CLI-0003','Visita técnica para diagnóstico','POR_VISITA',120.00,7,'RASCUNHO');

INSERT IGNORE INTO ordem_servico (id, empresa_id, descricao, cliente_id, servico_id, tecnico_id, status, endereco) VALUES
  ('OS-0001','EMP-1','Instalação de 2 splits na cozinha','CLI-0001','SRV-0001','TEC-0001','AGENDADA','Rua XV de Novembro, 100 - Curitiba'),
  ('OS-0002','EMP-1','Revisão do quadro elétrico','CLI-0002','SRV-0003','TEC-0002','EM_EXECUCAO','Av. Sete de Setembro, 50 - Curitiba'),
  ('OS-0003','EMP-1','Preventiva trimestral dos splits','CLI-0003','SRV-0002',NULL,'ABERTA','Rua Marechal Deodoro, 300 - Curitiba'),
  ('OS-0004','EMP-2','Limpeza de 4 splits do salão de festas','CLI-0004','SRV-0004',NULL,'ABERTA','Rua Padre Anchieta, 900 - Curitiba');

INSERT IGNORE INTO agendamento (id, empresa_id, ordem_id, tecnico_id, inicio, duracao_horas, confirmado, observacao) VALUES
  ('AGD-0001','EMP-1','OS-0001','TEC-0001','2026-10-05 08:30:00',4.0,TRUE,'Levar escada de 3 m.'),
  ('AGD-0002','EMP-1','OS-0002','TEC-0002','2026-10-06 14:00:00',3.0,FALSE,'Portaria exige aviso com 30 minutos de antecedência.');

INSERT IGNORE INTO item_estoque (id, empresa_id, sku, descricao, quantidade, estoque_minimo, custo_unitario) VALUES
  ('ITM-0001','EMP-1','TUBO-COBRE-3M','Tubo de cobre 3 m',20,5,85.00),
  ('ITM-0002','EMP-1','FILTRO-SPLIT','Filtro para split',8,10,22.00),
  ('ITM-0003','EMP-1','DISJ-32A','Disjuntor 32 A',12,4,38.50);

INSERT IGNORE INTO movimentacao_estoque (id, empresa_id, item_id, ordem_id, sku, tipo, qtd) VALUES
  ('MOV-0001','EMP-1','ITM-0001','OS-0001','TUBO-COBRE-3M','SAIDA',2);

INSERT IGNORE INTO lancamento_financeiro (id, empresa_id, descricao, tipo, valor, vencimento, status, forma_pagamento, valor_pago, ordem_id) VALUES
  ('LAN-0001','EMP-1','Sinal da instalação — Padaria Bom Pão','RECEITA',450.00,'2026-10-05','PAGO','PIX',450.00,'OS-0001'),
  ('LAN-0002','EMP-1','Saldo da instalação — Padaria Bom Pão','RECEITA',450.00,'2026-10-20','PENDENTE',NULL,NULL,'OS-0001'),
  ('LAN-0003','EMP-1','Compra de tubos de cobre','DESPESA',850.00,'2026-09-30','PAGO','BOLETO',850.00,NULL),
  ('LAN-0004','EMP-2','Aluguel da sala','DESPESA',1200.00,'2026-10-10','PENDENTE',NULL,NULL,NULL);
