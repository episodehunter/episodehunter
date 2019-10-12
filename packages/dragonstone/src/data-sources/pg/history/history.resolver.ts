import { Logger } from '@episodehunter/logger';
import { ShowId } from '@episodehunter/types';
import {
  UnwatchedEpisodeInput,
  WatchedEpisode,
  WatchedEpisodeInput
} from '@episodehunter/types/dragonstone-resolvers-types';
import { spreadInsert, sql } from 'squid/pg';
import { PgClient } from '../../../util/pg';
import { mapWatchedEpisodes, mapWatchedInputToWatchedEpisode } from './history.mapper';
import { HistoryLoader } from './hitsory.loader';
import { NumberOfEpisodesToWatchLoader } from './number-of-episodes-to-watch.loader';
import { WatchedEpisodeRecord } from '../schema';

export const createHistoryResolver = (
  client: PgClient,
  numberOfEpisodesToWatchLoader: NumberOfEpisodesToWatchLoader,
  historyLoader: HistoryLoader
) => ({
  async getHistoryPage(userId: number, page: number): Promise<WatchedEpisode[]> {
    const offset = (page * 20) | 0;
    const dbResult = await client.query<WatchedEpisodeRecord>(sql`
      SELECT *
      FROM tv_watched
      WHERE user_id = ${userId}
      ORDER BY time DESC LIMIT 20 OFFSET ${offset};`);
    return mapWatchedEpisodes(dbResult.rows);
  },

  async getWatchHistoryForEpisode(userId: number, showId: ShowId, episodenumber: number): Promise<WatchedEpisode[]> {
    return historyLoader
      .load({
        episodenumber,
        showId,
        userId
      })
      .then(r => mapWatchedEpisodes(r));
  },

  async getNumberOfEpisodesToWatchForShow(userId: number, showId: number): Promise<number> {
    return numberOfEpisodesToWatchLoader.load({ userId, showId });
  },

  async checkInEpisode(userId: number, watchedEpisodeInput: WatchedEpisodeInput): Promise<WatchedEpisodeInput> {
    const wh = mapWatchedInputToWatchedEpisode(watchedEpisodeInput, userId);
    await client.query(sql`INSERT INTO "tv_watched" ${spreadInsert(wh)};`);
    return watchedEpisodeInput;
  },

  async checkInEpisodeWithApiKey(
    apiKey: string,
    username: string,
    watchedEpisodeInput: WatchedEpisodeInput,
    logger: Logger
  ): Promise<WatchedEpisodeInput | null> {
    const userResult = await client.query<{ id: number }>(
      sql`SELECT id FROM users WHERE lower(name) = ${username.toLowerCase()} AND lower(api_key) = ${apiKey.toLowerCase()} LIMIT 1`
    );
    if (userResult.rowCount === 0) {
      logger.warn(`Could not find user with apiKey: ${apiKey} and username ${username}`);
      return null;
    }
    const wh = mapWatchedInputToWatchedEpisode(watchedEpisodeInput, userResult.rows[0].id);
    await client.query(sql`INSERT INTO "tv_watched" ${spreadInsert(wh)};`);
    return watchedEpisodeInput;
  },

  async checkInEpisodes(userId: number, watchedEpisodeInputs: WatchedEpisodeInput[]): Promise<WatchedEpisodeInput[]> {
    const wh = watchedEpisodeInputs.map(w => mapWatchedInputToWatchedEpisode(w, userId));
    await client.query(sql`INSERT INTO "tv_watched" ${spreadInsert(...wh)};`);
    return watchedEpisodeInputs;
  },

  async removeCheckedInEpisode(
    userId: number,
    unwatchedEpisodeInput: UnwatchedEpisodeInput
  ): Promise<UnwatchedEpisodeInput> {
    const { episodenumber, showId } = unwatchedEpisodeInput;
    await client.query(
      sql`DELETE FROM tv_watched WHERE episodenumber = ${episodenumber} AND show_id = ${showId} AND user_id = ${userId}`
    );
    return unwatchedEpisodeInput;
  }
});
