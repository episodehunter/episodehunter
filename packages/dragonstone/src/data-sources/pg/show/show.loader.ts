import { sql } from 'squid/pg';
import { PgClient } from '../../../util/pg';
import { ShowRecord } from '../schema';
import { createDataLoader, DataLoader } from '../util/data-loader';

export function createShowLoader(client: PgClient): ShowLoader {
  const getBatchShows = async (lookupKey: number[]): Promise<(ShowRecord | null)[]> => {
    const keys = lookupKey.map(key => `${key | 0}`).join(', ');
    const dbResult = await client.query<ShowRecord>(sql`
      SELECT * FROM shows
      WHERE id IN (${sql.raw(keys)})`);
    return lookupKey.map(key => {
      return dbResult.rows.find(row => row.id === key) || null;
    });
  };

  return createDataLoader<number, ShowRecord | null>(getBatchShows);
}

export type ShowLoader = DataLoader<number, ShowRecord | null>;
