import { ImportadorDados } from './ImportadorDados';
import { Cliente } from '../../../dominio/Cliente';

/** Formato: nome;documento;email;telefone;endereco */
export class ImportadorClientes extends ImportadorDados<Cliente> {
  private readonly empresaId: string;
  private contador = 0;

  constructor(empresaId: string) {
    super();
    this.empresaId = empresaId;
  }

  protected nomeImportador(): string { return 'Importador de Clientes'; }
  protected tabelaDestino(): string { return 'cliente'; }

  protected validar(c: string[]): string | null {
    if (c.length !== 5) return `esperados 5 campos, recebidos ${c.length}`;
    if (!c[0]) return 'nome obrigatório';
    const doc = c[1].replace(/\D/g, '');
    if (doc.length !== 11 && doc.length !== 14) return `documento inválido (${c[1]})`;
    if (!c[2].includes('@')) return `e-mail inválido (${c[2]})`;
    return null;
  }

  protected converter(c: string[]): Cliente {
    return new Cliente(`CLI-IMP-${++this.contador}`, this.empresaId, c[0], c[1], c[2], c[3], c[4]);
  }

  protected parametrosPersistencia(cli: Cliente): (string | number)[] {
    return [cli.getId(), cli.getEmpresaId(), cli.getNome(), cli.getDocumento(), cli.getEmail()];
  }
}
