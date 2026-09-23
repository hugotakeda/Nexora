import { ImportadorDados } from './ImportadorDados';
import { ItemEstoque } from '../../../dominio/ItemEstoque';

/** Formato (planilha exportada com vírgula): sku,descricao,quantidade,minimo,custo */
export class ImportadorEstoque extends ImportadorDados<ItemEstoque> {
  private contador = 0;

  protected nomeImportador(): string { return 'Importador de Estoque'; }
  protected tabelaDestino(): string { return 'item_estoque'; }

  // Hook sobrescrito: este arquivo usa vírgula como separador.
  protected separador(): string { return ','; }

  protected validar(c: string[]): string | null {
    if (c.length !== 5) return `esperados 5 campos, recebidos ${c.length}`;
    if (!/^[A-Z0-9-]+$/.test(c[0])) return `SKU inválido (${c[0]})`;
    const [qtd, min, custo] = [Number(c[2]), Number(c[3]), Number(c[4])];
    if (!Number.isInteger(qtd) || qtd < 0) return `quantidade inválida (${c[2]})`;
    if (!Number.isInteger(min) || min < 0) return `estoque mínimo inválido (${c[3]})`;
    if (Number.isNaN(custo) || custo <= 0) return `custo inválido (${c[4]})`;
    return null;
  }

  protected converter(c: string[]): ItemEstoque {
    return new ItemEstoque(`ITM-IMP-${++this.contador}`, c[0], c[1], Number(c[2]), Number(c[3]), Number(c[4]));
  }

  protected parametrosPersistencia(i: ItemEstoque): (string | number)[] {
    return [i.getId(), i.getSku(), i.getDescricao(), i.getQuantidade(), i.getCustoUnitario()];
  }
}
