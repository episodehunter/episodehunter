import { Logger } from '@episodehunter/logger';
import { Client } from 'pg';
import { Dragonstone, Message } from '@episodehunter/types';
import { PgShow } from '../types';
import { mapShow, mapShowInputToShow } from './show.mapper';
import { update, insert } from '../util/pg-util';

const showCache = new Map<number, Promise<Dragonstone.Show | null>>();

async function getShow(client: Client, id: number): Promise<Dragonstone.Show | null> {
  const dbResult = await client.query('SELECT * FROM shows WHERE id=$1', [ id ])
  const dbShow: PgShow = dbResult.rows[0];
  if (dbShow) {
    return mapShow(dbShow);
  }
  return null;
}

export const createShowResolver = (client: Client) => {
  return {
    async getShow(id: number): Promise<Dragonstone.Show | null> {
      if (!showCache.has(id)) {
        showCache.set(id, getShow(client, id));
      }
      return showCache.get(id) || null;
    },
    async updateShow(
      showId: number,
      showInput: Message.Dragonstone.ShowInput,
      logger: Logger
    ): Promise<Dragonstone.Show | null> {
      const dbResult = await client.query('SELECT * FROM shows WHERE id=$1 LIMIT 1', [ showId ])
      const dbShow: PgShow = dbResult.rows[0]
      if (!dbShow) {
        logger.log(`Show with id "${showId}" do not exist. Do not update.`);
        return null;
      }
      const newShow = mapShowInputToShow(showInput, showId);
      await client.query(update('shows', showId, newShow))
      return mapShow(newShow);
    },
    async addShow(showInput: Message.Dragonstone.ShowInput, logger: Logger): Promise<Dragonstone.Show> {
      const dbResult = await client.query('SELECT * FROM shows WHERE external_id_tvdb=$1 LIMIT 1', [ showInput.tvdbId ])
      if (dbResult.rowCount > 0) {
        logger.log(`Show with thetvdb ${showInput.tvdbId} do already exist`);
        return mapShow(dbResult.rows[0])!
      }
      const newShow = mapShowInputToShow(showInput);
      const dbInsertResult = await client.query(insert('shows', newShow as any))
      return mapShow(dbInsertResult.rows[0])!;
    }
  };
};
