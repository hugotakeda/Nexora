import { CampoModulo, ModuloCrud, Registro } from './tipos';

/** Validações reutilizáveis — usadas pelos módulos dos quatro integrantes. */
export const Validacoes = {
  documento(valor: string): string | null {
    const digitos = (valor ?? '').replace(/\D/g, '');
    return digitos.length === 11 || digitos.length === 14 ? null : 'Informe um CPF ou CNPJ válido.';
  },
  email(valor: string): string | null {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor ?? '') ? null : 'Informe um e-mail válido.';
  },
  positivo(valor: string): string | null {
    return Number(valor) > 0 ? null : 'Informe um valor maior que zero.';
  },
  naoNegativo(valor: string): string | null {
    return Number(valor) >= 0 ? null : 'O valor não pode ser negativo.';
  },
  sku(valor: string): string | null {
    return /^[A-Z0-9-]{3,}$/.test(valor ?? '') ? null : 'Use letras maiúsculas, números e hífen (mínimo 3 caracteres).';
  },
};

/** Percorre os campos do módulo aplicando obrigatoriedade, tipo e regras próprias. */
export function validarRegistro(modulo: ModuloCrud, dados: Registro): string | null {
  for (const campo of modulo.campos) {
    if (campo.somenteLeitura) continue;
    const bruto = dados[campo.nome];
    const valor = bruto === null || bruto === undefined ? '' : String(bruto).trim();

    if (campo.obrigatorio && valor === '') return `${campo.rotulo}: campo obrigatório.`;
    if (valor === '') continue;

    const erroTipo = validarTipo(campo, valor);
    if (erroTipo) return `${campo.rotulo}: ${erroTipo}`;

    const erroCampo = campo.validar?.(valor);
    if (erroCampo) return `${campo.rotulo}: ${erroCampo}`;
  }
  return modulo.validarRegistro?.(dados) ?? null;
}

function validarTipo(campo: CampoModulo, valor: string): string | null {
  switch (campo.tipo) {
    case 'email':
      return Validacoes.email(valor);
    case 'numero':
    case 'moeda':
      return Number.isNaN(Number(valor)) ? 'informe um número.' : null;
    case 'selecao':
      return campo.opcoes?.includes(valor) ? null : `valor deve ser um destes: ${campo.opcoes?.join(', ')}.`;
    case 'data':
    case 'datahora':
      return Number.isNaN(new Date(valor).getTime()) ? 'data inválida.' : null;
    default:
      return null;
  }
}
