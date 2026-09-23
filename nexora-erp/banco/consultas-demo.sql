-- ============================================================
-- NEXORA — consultas para a apresentação
-- Rodar no Adminer (http://localhost:8080) ou no terminal:
--   docker exec -it nexora-mysql mysql -unexora -pnexora nexora
-- Mostram que as tabelas estão ligadas e que a variabilidade mora no banco.
-- ============================================================
SET NAMES utf8mb4;
USE nexora;

-- 1. Ordens de serviço com cliente, serviço e técnico (JOIN de 4 tabelas)
SELECT os.id, os.descricao, c.nome AS cliente, s.descricao AS servico,
       COALESCE(t.nome, '— sem técnico —') AS tecnico, os.status
FROM ordem_servico os
JOIN cliente c  ON c.id = os.cliente_id
JOIN servico s  ON s.id = os.servico_id
LEFT JOIN tecnico t ON t.id = os.tecnico_id
WHERE os.empresa_id = 'EMP-1'
ORDER BY os.id;

-- 2. Agenda da semana por técnico
SELECT t.nome AS tecnico, a.inicio, a.duracao_horas, os.descricao AS atendimento,
       IF(a.confirmado, 'sim', 'não') AS confirmado
FROM agendamento a
JOIN tecnico t        ON t.id = a.tecnico_id
JOIN ordem_servico os ON os.id = a.ordem_id
ORDER BY a.inicio;

-- 3. Peças abaixo do estoque mínimo (mesma regra que destaca a linha na tela)
SELECT sku, descricao, quantidade, estoque_minimo
FROM item_estoque
WHERE quantidade < estoque_minimo;

-- 4. Resumo financeiro por tipo e situação
SELECT tipo, status, COUNT(*) AS lancamentos, SUM(valor) AS total
FROM lancamento_financeiro
WHERE empresa_id = 'EMP-1'
GROUP BY tipo, status
ORDER BY tipo, status;

-- 5. VARIABILIDADE: qual produto da Linha de Produto cada empresa contratou
--    e quais ajustes individuais de feature ela tem.
SELECT e.id, e.razao_social, e.linha_produto,
       COALESCE(GROUP_CONCAT(CONCAT(f.feature, IF(f.habilitada, ' (ligada)', ' (desligada)'))), '— sem ajustes —') AS ajustes
FROM empresa e
LEFT JOIN empresa_feature f ON f.empresa_id = e.id
GROUP BY e.id, e.razao_social, e.linha_produto;

-- 6. MULTIEMPRESA: cada empresa só enxerga os próprios dados
SELECT empresa_id, COUNT(*) AS clientes FROM cliente GROUP BY empresa_id;

-- 7. Rastreabilidade: material que saiu do estoque para cada OS
SELECT m.criado_em, m.sku, m.tipo, m.qtd, os.descricao AS ordem
FROM movimentacao_estoque m
LEFT JOIN ordem_servico os ON os.id = m.ordem_id;
