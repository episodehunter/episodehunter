import { Logger } from '@episodehunter/logger';
import { Client } from 'pg';
import { Dragonstone, Message, ShowId } from '@episodehunter/types';
import { PgShow } from '../pg-types';
import { mapShow, mapShowInputToShow } from './show.mapper';
import { update, insert } from '../util/pg-util';
import { ShowLoader } from './show.loader';

export const createShowResolver = (client: Client, showLoader: ShowLoader) => {
  return {
    async getShow(id: ShowId): Promise<Dragonstone.Show | null> {
      return showLoader.load(id).then(mapShow);
    },
    async getNumberOfFollowers(showId: ShowId): Promise<number> {
      const dbResult = await client.query(`SELECT COUNT(*) as c FROM "following" WHERE show_id = $1;`, [showId]);
      return dbResult.rows[0].c;
    },
    async isFollowingShow(showId: ShowId, userId: number): Promise<boolean> {
      const dbResult = await client.query(`SELECT * FROM following WHERE user_id = $1 AND show_id = $2 LIMIT 1;`, [
        userId,
        showId
      ]);
      return dbResult.rowCount > 0;
    },
    async updateShow(
      showId: number,
      showInput: Message.Dragonstone.ShowInput,
      logger: Logger
    ): Promise<Dragonstone.Show | null> {
      const dbResult = await client.query('SELECT * FROM shows WHERE id=$1 LIMIT 1', [showId]);
      const dbShow: PgShow = dbResult.rows[0];
      if (!dbShow) {
        logger.log(`Show with id "${showId}" do not exist. Do not update.`);
        return null;
      }
      const newShow = mapShowInputToShow(showInput, showId);
      await client.query(update('shows', showId, newShow));
      return mapShow(newShow);
    },
    async addShow(showInput: Message.Dragonstone.ShowInput, logger: Logger): Promise<Dragonstone.Show> {
      const dbResult = await client.query('SELECT * FROM shows WHERE external_id_tvdb=$1 LIMIT 1', [showInput.tvdbId]);
      if (dbResult.rowCount > 0) {
        logger.log(`Show with thetvdb ${showInput.tvdbId} do already exist`);
        return mapShow(dbResult.rows[0])!;
      }
      const newShow = mapShowInputToShow(showInput);
      const dbInsertResult = await client.query(insert('shows', newShow as any));
      return mapShow(dbInsertResult.rows[0])!;
    }
  };
};
