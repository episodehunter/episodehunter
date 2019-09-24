import { Client, QueryConfig, TypedQueryResult } from 'pg';
import { config } from '../config';

export class DatabaseError extends Error {
  code: number;
  constructor({code, message}: {code: number, message: string}) {
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
  let ssl = true;
  if (process.env.NODE_ENV === 'test') {
    ssl = false;
  }
  const client = new Client({ connectionString: config.pgConnectionUri, ssl });
  client.connect();

  const proxy: PgClient = {
    end() {
      return client.end();
    },
    query(queryConfig, values) {
      return client.query(queryConfig, values).catch(error => {
        return Promise.reject(new DatabaseError(error));
      });
    }
  }

  return proxy;
}
