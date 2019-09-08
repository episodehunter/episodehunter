import { Dragonstone } from '@episodehunter/types';
import { Client } from 'pg';
import { sql } from 'squid/pg';
import { TitleRecord } from '../schema';
import { mapTitles } from './title.mappers';

export const createTitlesResolver = (client: Client) => ({
  async getTitles(): Promise<Dragonstone.Title[]> {
    const dbResult = await client.query<TitleRecord>(sql`SELECT * FROM titles`)
    return mapTitles(dbResult.rows);
  }
});
