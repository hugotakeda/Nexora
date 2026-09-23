/** Camada única de acesso à API. Todas as telas passam por aqui. */
async function requisicao(url, opcoes = {}) {
  const resposta = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opcoes,
  });
  if (resposta.status === 204) return null;
  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(corpo.erro || 'Não foi possível concluir a operação.');
  return corpo;
}

export const api = {
  modulos: () => requisicao('/api/modulos'),
  variabilidade: () => requisicao('/api/variabilidade'),
  trocarLinha: (linha) => requisicao('/api/variabilidade/linha', { method: 'PUT', body: JSON.stringify({ linha }) }),
  definirFeature: (feature, habilitada) =>
    requisicao('/api/variabilidade/feature', { method: 'PUT', body: JSON.stringify({ feature, habilitada }) }),
  opcoes: (modulo, rotulo) => requisicao(`/api/opcoes/${modulo}?rotulo=${encodeURIComponent(rotulo)}`),
  listar: (modulo, busca) => requisicao(`/api/${modulo}?busca=${encodeURIComponent(busca || '')}`),
  buscar: (modulo, id) => requisicao(`/api/${modulo}/${id}`),
  criar: (modulo, dados) => requisicao(`/api/${modulo}`, { method: 'POST', body: JSON.stringify(dados) }),
  atualizar: (modulo, id, dados) => requisicao(`/api/${modulo}/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
  excluir: (modulo, id) => requisicao(`/api/${modulo}/${id}`, { method: 'DELETE' }),
};
