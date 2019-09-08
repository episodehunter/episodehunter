import { Client } from 'pg';
import DataLoader from 'dataloader';
import { ShowRecord } from '../schema';
import { sql } from 'squid/pg';

export function createShowLoader(client: Client): ShowLoader {
  const getBatchShows = async (lookupKey: number[]): Promise<(ShowRecord | null)[]> => {
    const keys = lookupKey.map(key => `${key | 0}`).join(', ');
    const dbResult = await client.query<ShowRecord>(sql`
      SELECT * FROM shows
      WHERE id IN (${sql.raw(keys)})`);
    return lookupKey.map(key => {
      return dbResult.rows.find(row => row.id === key) || null;
    });
  };

  return new DataLoader<number, ShowRecord | null>(getBatchShows);
}

export type ShowLoader = DataLoader<number, ShowRecord | null>;
