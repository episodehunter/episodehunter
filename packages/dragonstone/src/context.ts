import { createResolver } from './data-sources/pg';
import { AuthenticationError } from 'apollo-server-lambda';
import { Logger } from '@episodehunter/kingsguard';
import { Client } from 'pg';

export const createContext = (client: Client) => {
  return {
    pgResolver: createResolver(client),
    logger: {} as Logger,
    firebaseUid: null as null | string,
    async getUid(): Promise<number> {
      if (!this.firebaseUid) {
        throw new AuthenticationError('must authenticate');
      }
      const dbResult = await client.query(`SELECT id FROM users WHERE firebase_id = $1 LIMIT 1`, [this.firebaseUid])
      if (dbResult.rowCount === 0) {
        throw new AuthenticationError('Could not find user');
      }
      return dbResult.rows[0].id;
    }
  };
};

export type Context = ReturnType<typeof createContext>;
