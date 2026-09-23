// ============================================================
// NEXORA — teste de fumaça da API (os 8 CRUDs + variabilidade)
//
// Uso: com o sistema rodando (npm start), em outro terminal:
//      npm run testar
//
// Cria, lê, atualiza e exclui um registro em cada tela, confere as
// regras de negócio e a porta de variabilidade. Não depende de nenhuma
// biblioteca: usa o fetch nativo do Node 18+.
// ============================================================

const BASE = process.env.NEXORA_URL ?? 'http://localhost:3000';
let falhas = 0;
let total = 0;

function conferir(descricao, condicao, detalhe = '') {
  total++;
  if (condicao) console.log(`  ok   ${descricao}`);
  else { falhas++; console.log(`  FALHOU  ${descricao} ${detalhe}`); }
}

async function chamar(metodo, rota, corpo) {
  const r = await fetch(`${BASE}${rota}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const texto = await r.text();
  let json = null;
  try { json = texto ? JSON.parse(texto) : null; } catch { json = texto; }
  return { status: r.status, json };
}

/** Ciclo completo de CRUD para um módulo. Devolve o id criado (e já excluído). */
async function cicloCrud(modulo, novo, alteracao) {
  console.log(`\n[${modulo}]`);
  const c = await chamar('POST', `/api/${modulo}`, novo);
  conferir('CREATE responde 201', c.status === 201, JSON.stringify(c.json));
  const id = c.json?.id;
  conferir('id gerado pelo servidor', typeof id === 'string' && id.includes('-'));

  const l = await chamar('GET', `/api/${modulo}`);
  conferir('READ lista contém o novo registro', Array.isArray(l.json) && l.json.some((x) => x.id === id));

  const u = await chamar('PUT', `/api/${modulo}/${id}`, { ...novo, ...alteracao });
  const [campo, valor] = Object.entries(alteracao)[0];
  const igual = (a, b) => (isNaN(Number(a)) ? String(a) === String(b) : Number(a) === Number(b));
  conferir('UPDATE grava a alteração', u.status === 200 && igual(u.json?.[campo], valor),
    JSON.stringify(u.json));

  const d = await chamar('DELETE', `/api/${modulo}/${id}`);
  conferir('DELETE responde 204', d.status === 204);
  const g = await chamar('GET', `/api/${modulo}/${id}`);
  conferir('registro excluído não é mais encontrado', g.status === 404);
  return id;
}

async function principal() {
  console.log(`Testando ${BASE}`);
  const mods = await chamar('GET', '/api/modulos');
  conferir('API responde com os 8 módulos', mods.status === 200 && mods.json.length === 8);

  // Garante o produto completo antes de começar.
  await chamar('PUT', '/api/variabilidade/linha', { linha: 'FIELD' });

  await cicloCrud('clientes',
    { nome: 'Cliente de Teste', documento: '123.456.789-09', email: 'teste@nexora.dev', telefone: '(41) 90000-0000', endereco: 'Rua Teste, 1' },
    { nome: 'Cliente de Teste (editado)' });

  await cicloCrud('servicos',
    { descricao: 'Serviço de teste', categoria: 'eletrica', preco_base: 200, valor_hora: 90, duracao_horas: 2 },
    { preco_base: 250 });

  await cicloCrud('tecnicos',
    { nome: 'Técnico de Teste', especialidade: 'eletrica', telefone: '(41) 98888-9999', capacidade_maxima: 2, disponivel: true },
    { capacidade_maxima: 4 });

  await cicloCrud('orcamentos',
    { cliente_id: 'CLI-0001', descricao: 'Orçamento de teste', estrategia_preco: 'POR_HORA', valor_total: 360, validade_dias: 10, status: 'RASCUNHO' },
    { status: 'ENVIADO' });

  await cicloCrud('ordens-servico',
    { descricao: 'OS de teste', cliente_id: 'CLI-0001', servico_id: 'SRV-0001', tecnico_id: 'TEC-0001', status: 'ABERTA', endereco: 'Rua Teste, 1' },
    { status: 'EM_EXECUCAO' });

  await cicloCrud('agendamentos',
    { ordem_id: 'OS-0001', tecnico_id: 'TEC-0001', inicio: '2026-10-01 09:00:00', duracao_horas: 2, confirmado: false, observacao: 'teste' },
    { confirmado: 1 });

  await cicloCrud('estoque',
    { sku: 'TESTE-SKU-1', descricao: 'Peça de teste', quantidade: 3, estoque_minimo: 1, custo_unitario: 9.9 },
    { quantidade: 7 });

  await cicloCrud('financeiro',
    { descricao: 'Lançamento de teste', tipo: 'RECEITA', valor: 100, vencimento: '2026-10-10', status: 'PENDENTE', forma_pagamento: '' },
    { status: 'CANCELADO' });

  console.log('\n[regras de negócio e erros]');
  let r = await chamar('POST', '/api/clientes', { nome: 'X', documento: '123', email: 'x@x.com' });
  conferir('documento inválido → 400', r.status === 400, JSON.stringify(r.json));

  r = await chamar('POST', '/api/clientes', { nome: 'Duplicado', documento: '98.765.432/0001-10', email: 'd@d.com' });
  conferir('CPF/CNPJ repetido → 409', r.status === 409, JSON.stringify(r.json));

  r = await chamar('POST', '/api/ordens-servico', { descricao: 'Sem técnico', cliente_id: 'CLI-0001', servico_id: 'SRV-0001', status: 'AGENDADA' });
  conferir('OS agendada sem técnico → 400', r.status === 400, JSON.stringify(r.json));

  r = await chamar('POST', '/api/financeiro', { descricao: 'Pago sem forma', tipo: 'RECEITA', valor: 10, vencimento: '2026-10-10', status: 'PAGO' });
  conferir('lançamento pago sem forma de pagamento → 400', r.status === 400);

  r = await chamar('POST', '/api/agendamentos', { ordem_id: 'OS-0001', tecnico_id: 'TEC-0001', inicio: '2026-10-01 09:00', duracao_horas: 13 });
  conferir('agendamento acima de 12 h → 400', r.status === 400);

  r = await chamar('POST', '/api/orcamentos', { cliente_id: 'CLI-9999', descricao: 'Cliente inexistente', estrategia_preco: 'PRECO_FIXO', valor_total: 10, validade_dias: 5, status: 'RASCUNHO' });
  conferir('referência inexistente → 400', r.status === 400, JSON.stringify(r.json));

  r = await chamar('DELETE', '/api/clientes/CLI-0001');
  conferir('excluir cliente usado em OS → 409', r.status === 409, JSON.stringify(r.json));

  console.log('\n[isolamento entre empresas]');
  r = await chamar('GET', '/api/clientes/CLI-0004');
  conferir('cliente de outra empresa (EMP-2) não aparece → 404', r.status === 404);
  r = await chamar('DELETE', '/api/clientes/CLI-0004');
  conferir('cliente de outra empresa não pode ser excluído → 404', r.status === 404);
  r = await chamar('GET', '/api/clientes');
  conferir('listagem só traz clientes da própria empresa', r.json.every((c) => c.id !== 'CLI-0004'));

  console.log('\n[variabilidade — Linha de Produto]');
  r = await chamar('PUT', '/api/variabilidade/linha', { linha: 'CORE' });
  conferir('trocar para NEXORA Core', r.status === 200 && !r.json.ativas.includes('estoque'));
  r = await chamar('GET', '/api/estoque');
  conferir('Core: /api/estoque bloqueado com 403', r.status === 403);
  r = await chamar('GET', '/api/clientes');
  conferir('Core: núcleo (clientes) continua liberado', r.status === 200);

  r = await chamar('PUT', '/api/variabilidade/feature', { feature: 'estoque', habilitada: true });
  conferir('ligar só a feature estoque', r.status === 200 && r.json.ativas.includes('estoque'));
  r = await chamar('GET', '/api/estoque');
  conferir('estoque volta sem recompilar', r.status === 200);

  r = await chamar('PUT', '/api/variabilidade/feature', { feature: 'clientes', habilitada: false });
  conferir('núcleo não pode ser desligado → 400', r.status === 400);

  r = await chamar('PUT', '/api/variabilidade/linha', { linha: 'TECH' });
  conferir('NEXORA Tech libera orçamentos e estoque', r.json.ativas.includes('orcamentos') && r.json.ativas.includes('estoque') && !r.json.ativas.includes('agenda'));

  await chamar('PUT', '/api/variabilidade/linha', { linha: 'FIELD' });

  console.log(`\n${total - falhas}/${total} verificações passaram.`);
  process.exit(falhas ? 1 : 0);
}

principal().catch((e) => {
  console.error(`\nNão foi possível falar com ${BASE}. O sistema está rodando (npm start)?`);
  console.error(e.message);
  process.exit(1);
});
