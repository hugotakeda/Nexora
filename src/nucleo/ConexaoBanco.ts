import mysql, { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export type Parametro = string | number | boolean | Date | null;

export interface ConfiguracaoBanco {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

/**
 * SINGLETON — Exemplo 1: Conexão com o banco de dados MySQL.
 *
 * Problema: cada DAO abrindo sua própria conexão esgota o limite do servidor.
 * Solução: construtor privado + atributo estático + getInstance(), com um
 * pool de conexões criado uma única vez para toda a aplicação.
 *
 * Modo simulado: quando não há MySQL disponível (ex.: demonstração dos padrões
 * em sala), a MESMA classe apenas imprime o SQL em vez de executá-lo.
 */
export class ConexaoBanco {
  private static instancia: ConexaoBanco | null = null;

  private readonly config: ConfiguracaoBanco;
  private readonly criadaEm: Date;
  private pool: Pool | null;
  private simulado: boolean;
  private totalComandos: number;

  // Construtor PRIVADO: ninguém de fora consegue fazer "new ConexaoBanco()".
  private constructor() {
    this.config = {
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 3306),
      user: process.env.DB_USER ?? 'nexora',
      password: process.env.DB_PASSWORD ?? 'nexora',
      database: process.env.DB_NAME ?? 'nexora',
    };
    this.criadaEm = new Date();
    this.pool = null;
    this.simulado = false;
    this.totalComandos = 0;
    console.log('[ConexaoBanco] >>> Instância criada (esta mensagem deve aparecer UMA vez)');
  }

  public static getInstance(): ConexaoBanco {
    if (ConexaoBanco.instancia === null) {
      ConexaoBanco.instancia = new ConexaoBanco();
    }
    return ConexaoBanco.instancia;
  }

  /** Usado pela demonstração dos padrões, que roda sem servidor MySQL. */
  public ativarModoSimulado(): void {
    this.simulado = true;
    console.log('[ConexaoBanco] Modo simulado: os comandos SQL serão apenas exibidos.');
  }

  /** Cria o pool na primeira chamada e o reaproveita nas seguintes. */
  public conectar(): Pool {
    if (this.pool === null) {
      this.pool = mysql.createPool({
        ...this.config,
        waitForConnections: true,
        connectionLimit: 10,
        charset: 'utf8mb4',
        dateStrings: true, // datas chegam como texto, evitando fuso horário indevido
        namedPlaceholders: false,
      });
      console.log(`[ConexaoBanco] Pool criado para mysql://${this.config.host}:${this.config.port}/${this.config.database}`);
    }
    return this.pool;
  }

  /** SELECT — devolve as linhas encontradas. */
  public async consultar<T extends RowDataPacket>(sql: string, parametros: Parametro[] = []): Promise<T[]> {
    this.totalComandos++;
    if (this.simulado) {
      console.log(`  [SQL #${this.totalComandos}] ${sql} ${JSON.stringify(parametros)}`);
      return [];
    }
    const [linhas] = await this.conectar().query<T[]>(sql, parametros);
    return linhas;
  }

  /** INSERT / UPDATE / DELETE — devolve linhas afetadas e id gerado. */
  public async executar(sql: string, parametros: Parametro[] = []): Promise<ResultSetHeader> {
    this.totalComandos++;
    if (this.simulado) {
      console.log(`  [SQL #${this.totalComandos}] ${sql} ${JSON.stringify(parametros)}`);
      return { affectedRows: 0, insertId: 0 } as ResultSetHeader;
    }
    const [resultado] = await this.conectar().execute<ResultSetHeader>(sql, parametros);
    return resultado;
  }

  public async testarConexao(): Promise<void> {
    await this.consultar('SELECT 1 AS ok');
  }

  public async desconectar(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    console.log('[ConexaoBanco] Conexão encerrada.');
  }

  public getTotalComandos(): number { return this.totalComandos; }
  public getCriadaEm(): Date { return this.criadaEm; }
  public estaSimulado(): boolean { return this.simulado; }
  public getConfig(): ConfiguracaoBanco { return { ...this.config, password: '***' }; }
}
