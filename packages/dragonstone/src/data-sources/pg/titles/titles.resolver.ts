import { Client } from 'pg';
import { Dragonstone } from '@episodehunter/types';
import { mapTitles } from './title.mappers';

export const createTitlesResolver = (client: Client) => ({
  async getTitles(): Promise<Dragonstone.Title[]> {
    const dbResult = await client.query('SELECT * FROM titles')
    return mapTitles(dbResult.rows);
  }
});
