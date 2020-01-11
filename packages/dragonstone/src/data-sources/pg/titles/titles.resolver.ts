import { Dragonstone } from '@episodehunter/types';
import { sql } from 'squid/pg';
import { PgClient } from '../../../util/pg';
import { TitleRecord } from '../schema';
import { mapTitles } from './title.mappers';

export const createTitlesResolver = (client: PgClient) => ({
  async getTitles(): Promise<Dragonstone.Title[]> {
    const dbResult = await client.query<TitleRecord>(sql`SELECT * FROM titles`);
    return mapTitles(dbResult.rows);
  },
  async oldestUpdatedShows(limit: number): Promise<Dragonstone.Title[]> {
    const dbResult = await client.query<TitleRecord>(sql`
      SELECT * FROM titles ORDER BY lastupdated_check ASC LIMIT ${limit}
    `);
    return mapTitles(dbResult.rows);
  },
});
