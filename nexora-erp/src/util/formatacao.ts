/** Utilitários de formatação reutilizados em todo o projeto. */
export function moeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function data(d: Date): string {
  return d.toLocaleDateString('pt-BR');
}

export function dataHora(d: Date): string {
  return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

export function titulo(texto: string): void {
  console.log('\n' + '='.repeat(70));
  console.log(texto);
  console.log('='.repeat(70));
}
