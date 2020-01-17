import { Logger } from '@episodehunter/logger';
import { Message, ShowId } from '@episodehunter/types';
import { spreadInsert, sql, spreadUpdate } from 'squid/pg';
import { RootShow } from '../../../resolvers/type';
import { PgClient } from '../../../util/pg';
import { ShowRecord } from '../schema';
import { update } from '../util/pg-util';
import { ShowLoader } from './show.loader';
import { mapShow, mapShowInputToShow } from './show.mapper';

export const createShowResolver = (client: PgClient, showLoader: ShowLoader) => {
  return {
    async getShow(id: ShowId): Promise<RootShow | null> {
      return showLoader.load(id).then(show => mapShow(show));
    },
    async findShow(props: { theTvDbId?: number | null }): Promise<RootShow | null> {
      if (props.theTvDbId) {
        const dbResult = await client.query<ShowRecord>(
          sql`SELECT * FROM shows WHERE external_id_tvdb = ${props.theTvDbId}`
        );
        return mapShow(dbResult.rows[0]);
      }
      return null;
    },
    async getNumberOfFollowers(showId: ShowId): Promise<number> {
      const dbResult = await client.query<{ c: number }>(
        sql`SELECT COUNT(*) as c FROM "following" WHERE show_id = ${showId};`
      );
      return dbResult.rows[0].c;
    },
    async isFollowingShow(showId: ShowId, userId: number): Promise<boolean> {
      const dbResult = await client.query(
        sql`SELECT * FROM following WHERE user_id = ${userId} AND show_id = ${showId} LIMIT 1;`
      );
      return dbResult.rowCount > 0;
    },
    async updateShow(
      showId: number,
      showInput: Message.Dragonstone.ShowInput,
      logger: Logger
    ): Promise<RootShow | null> {
      const dbResult = await client.query<ShowRecord>(sql`SELECT * FROM shows WHERE id=${showId} LIMIT 1`);
      const dbShow: ShowRecord = dbResult.rows[0];
      if (!dbShow) {
        logger.log(`Show with id "${showId}" do not exist. Do not update.`);
        return null;
      }
      const newShow = mapShowInputToShow(showInput, showId);
      await client.query(update('shows', showId, newShow));
      return mapShow(newShow);
    },
    async updateShowMetadata(showId: number, metadataInput: Message.Dragonstone.ShowMetadata): Promise<boolean> {
      const row: Partial<Pick<ShowRecord, 'lastupdated' | 'lastupdated_check' | 'update_disable'>> = {};
      if (metadataInput.disableUpdate !== undefined) {
        row.update_disable = metadataInput.disableUpdate;
      }
      if (metadataInput.lastupdate !== undefined) {
        row.lastupdated = metadataInput.lastupdate;
      }
      if (metadataInput.lastupdateCheck !== undefined) {
        row.lastupdated_check = metadataInput.lastupdateCheck;
      }
      if (Object.keys(row).length === 0) {
        return false;
      }
      return client
        .query<void>(sql`UPDATE shows SET ${spreadUpdate(row)} WHERE id=${showId} RETURNING id`)
        .then(r => Boolean(r.rowCount));
    },
    async addShow(showInput: Message.Dragonstone.ShowInput, logger: Logger): Promise<RootShow> {
      const dbResult = await client.query<ShowRecord>(
        sql`SELECT * FROM "shows" WHERE external_id_tvdb=${showInput.tvdbId} LIMIT 1`
      );
      if (dbResult.rowCount > 0) {
        logger.log(`Show with thetvdb ${showInput.tvdbId} do already exist`);
        return mapShow(dbResult.rows[0])!;
      }
      const newShow = mapShowInputToShow(showInput);
      const dbInsertResult = await client.query<ShowRecord>(
        sql`INSERT INTO "shows" ${spreadInsert(newShow)} RETURNING *;`
      );
      return mapShow(dbInsertResult.rows[0])!;
    }
  };
};
