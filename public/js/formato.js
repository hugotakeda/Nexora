/** Formatação e escape reutilizados pelas telas. */
export const escapar = (t) => String(t ?? '').replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const moeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const data = (v) => (v ? new Date(v).toLocaleDateString('pt-BR') : '—');

export const dataHora = (v) => (v
  ? new Date(v).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—');

/** Valor de um campo do banco formatado para a tabela. */
export function paraTexto(campo, valor, rotulosReferencia) {
  if (valor === null || valor === undefined || valor === '') return '—';
  switch (campo.tipo) {
    case 'moeda': return moeda(valor);
    case 'data': return data(valor);
    case 'datahora': return dataHora(valor);
    case 'booleano': return Number(valor) ? 'Sim' : 'Não';
    case 'referencia': return rotulosReferencia?.[campo.nome]?.[valor] ?? valor;
    case 'selecao': return String(valor).replace(/_/g, ' ').toLowerCase();
    default: return valor;
  }
}

/** Valor pronto para preencher o input do formulário. */
export function paraInput(campo, valor) {
  if (valor === null || valor === undefined) return '';
  if (campo.tipo === 'data') return String(valor).slice(0, 10);
  if (campo.tipo === 'datahora') {
    const d = new Date(valor);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  return valor;
}

/** Cor da etiqueta conforme a situação do registro. */
export function corDoStatus(valor) {
  const v = String(valor).toUpperCase();
  if (['APROVADO', 'CONCLUIDA', 'PAGO', 'ENVIADO'].includes(v)) return 'ok';
  if (['EM_EXECUCAO', 'AGENDADA', 'PENDENTE'].includes(v)) return 'alerta';
  if (['REPROVADO', 'CANCELADA', 'CANCELADO'].includes(v)) return 'erro';
  return 'azul';
}
