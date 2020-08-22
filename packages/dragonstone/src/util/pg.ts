import { Client, QueryConfig, TypedQueryResult } from 'pg';
import { config } from '../config';

export class DatabaseError extends Error {
  code: number;
  constructor({ code, message }: { code: number; message: string }) {
    super();
    this.name = 'DatabaseError';
    this.message = message;
    this.code = code;
  }
}

export interface PgClient {
  end(): Promise<void>;
  query<RowType = unknown>(queryConfig: QueryConfig | string, values?: any[]): Promise<TypedQueryResult<RowType>>;
}

export function createPostgresClient(): PgClient {
  const ssl = (process.env.NODE_ENV === 'test') ? false : { rejectUnauthorized: false };
  const client = new Client({ connectionString: config.pgConnectionUri, ssl });
  const connecting = client.connect();

  const proxy: PgClient = {
    end() {
      return connecting
        .then(() => client.end())
        .catch(error => {
          return Promise.reject(new DatabaseError(error));
        });
    },
    query(queryConfig, values) {
      return connecting
        .then(() => client.query(queryConfig, values))
        .catch(error => {
          return Promise.reject(new DatabaseError(error));
        });
    },
  };

  return proxy;
}
