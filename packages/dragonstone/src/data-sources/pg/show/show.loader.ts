import { Client } from 'pg';
import DataLoader from 'dataLoader';
import { PgShow } from '../types';

export function createShowLoader(client: Client): ShowLoader {
  const getBatchShows = async (lookupKey: number[]): Promise<PgShow[]> => {
    const keys = lookupKey.map(key => `${key | 0}`).join(', ');
    const dbResult = await client.query(`
      SELECT * FROM shows
      WHERE id IN (${keys})
    `);
    return lookupKey.map(key => {
      return (
        dbResult.rows.find((row: PgShow) => row.id === key) || null
      );
    });
  };

  return new DataLoader<number, PgShow>(getBatchShows);
}

export type ShowLoader = DataLoader<number, PgShow>;
