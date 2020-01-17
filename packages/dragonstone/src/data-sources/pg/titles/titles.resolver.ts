import { Dragonstone, Message } from '@episodehunter/types';
import { unixTimestamp } from '@episodehunter/utils';
import { sql } from 'squid/pg';
import { PgClient } from '../../../util/pg';
import { TitleRecord, ShowRecord } from '../schema';
import { mapTitles, mapNextShowToUpdate } from './title.mappers';

export const createTitlesResolver = (client: PgClient) => ({
  async getTitles(): Promise<Dragonstone.Title[]> {
    const dbResult = await client.query<TitleRecord>(sql`SELECT * FROM titles`);
    return mapTitles(dbResult.rows);
  },
  async nextToUpdate(limit: number): Promise<Message.Dragonstone.NextShowToUpdate[]> {
    const from = unixTimestamp() - 3 * 24 * 60 * 60;
    const dbResult = await client.query<
      Pick<ShowRecord, 'id' | 'name' | 'external_id_tvdb' | 'lastupdated' | 'lastupdated_check'>
    >(sql`
      SELECT s.id, s.name, s.external_id_tvdb, s.lastupdated, s.lastupdated_check FROM shows s WHERE s.ended = false AND s.update_disable = false AND s.lastupdated_check < ${from} ORDER BY s.lastupdated_check ASC LIMIT ${limit};
    `);
    return mapNextShowToUpdate(dbResult.rows);
  }
});
