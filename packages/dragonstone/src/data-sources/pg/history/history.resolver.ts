import { Logger } from '@episodehunter/logger';
import { Dragonstone, ShowId } from '@episodehunter/types';
import { Client } from 'pg';
import { sql, spreadInsert } from 'squid/pg';
import { mapWatchedEpisodes, mapWatchedInputToWatchedEpisode } from './history.mapper';
import { HistoryLoader } from './hitsory.loader';
import { NumberOfEpisodesToWatchLoader } from './number-of-episodes-to-watch.loader';

export const createHistoryResolver = (
  client: Client,
  numberOfEpisodesToWatchLoader: NumberOfEpisodesToWatchLoader,
  historyLoader: HistoryLoader
) => ({
  async getHistoryPage(userId: number, page: number): Promise<Dragonstone.WatchedEpisode.WatchedEpisode[]> {
    const offset = (page * 20) | 0;
    const dbResult = await client.query(sql`
      SELECT *
      FROM tv_watched
      WHERE user_id = ${userId}
      ORDER BY time DESC LIMIT 20 OFFSET ${offset};`
    );
    return mapWatchedEpisodes(dbResult.rows);
  },

  async getWatchHistoryForEpisode(
    userId: number,
    showId: ShowId,
    episodenumber: number
  ): Promise<Dragonstone.WatchedEpisode.WatchedEpisode[]> {
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

  async checkInEpisode(
    userId: number,
    watchedEpisodeInput: Dragonstone.WatchedEpisode.InternalWatchedEpisodeInput
  ): Promise<Dragonstone.WatchedEpisode.InternalWatchedEpisodeInput> {
    const wh = mapWatchedInputToWatchedEpisode(watchedEpisodeInput, userId);
    await client.query(sql`INSERT INTO "tv_watched" ${spreadInsert(wh)};`);
    return watchedEpisodeInput;
  },

  async checkInEpisodeWithApiKey(
    apiKey: string,
    username: string,
    watchedEpisodeInput: Dragonstone.WatchedEpisode.InternalWatchedEpisodeInput,
    logger: Logger
  ): Promise<Dragonstone.WatchedEpisode.InternalWatchedEpisodeInput | null> {
    const userResult = await client.query(sql`SELECT id FROM users WHERE name = ${username} AND api_key = ${apiKey} LIMIT 1`)
    if (userResult.rowCount === 0) {
      logger.warn(`Could not find user with apiKey: ${apiKey} and username ${username}`)
      return null;
    }
    const wh = mapWatchedInputToWatchedEpisode(watchedEpisodeInput, userResult.rows[0].id);
    await client.query(sql`INSERT INTO "tv_watched" ${spreadInsert(wh)};`);
    return watchedEpisodeInput;
  },

  async checkInEpisodes(
    userId: number,
    watchedEpisodeInputs: Dragonstone.WatchedEpisode.InternalWatchedEpisodeInput[]
  ): Promise<Dragonstone.WatchedEpisode.InternalWatchedEpisodeInput[]> {
    const wh = watchedEpisodeInputs.map(w => mapWatchedInputToWatchedEpisode(w, userId));
    await client.query(sql`INSERT INTO "tv_watched" ${spreadInsert(...wh)};`);
    return watchedEpisodeInputs;
  },

  async removeCheckedInEpisode(
    userId: number,
    unwatchedEpisodeInput: Dragonstone.WatchedEpisode.UnwatchedEpisodeInput
  ): Promise<Dragonstone.WatchedEpisode.UnwatchedEpisodeInput> {
    const { episodenumber, showId } = unwatchedEpisodeInput;
    await client.query(sql`DELETE FROM tv_watched WHERE episodenumber = ${episodenumber} AND show_id = ${showId} AND user_id = ${userId}`);
    return unwatchedEpisodeInput;
  }
});
