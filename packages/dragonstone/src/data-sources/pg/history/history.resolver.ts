import { Logger } from '@episodehunter/logger';
import { Dragonstone, ShowId } from '@episodehunter/types';
import { Client } from 'pg';
import { insert, inserts } from '../util/pg-util';
import { mapWatchedEpisodes, mapWatchedInputToWatchedEpisode } from './history.mapper';
import { HistoryLoader } from './hitsory.loader';
import { NumberOfEpisodesToWatchLoader } from './number-of-episodes-to-watch.loader';

export const createHistoryResolver = (
  client: Client,
  numberOfEpisodesToWatchLoader: NumberOfEpisodesToWatchLoader,
  historyLoader: HistoryLoader
) => ({
  async getHistoryPage(userId: number, page: number): Promise<Dragonstone.WatchedEpisode.WatchedEpisode[]> {
    const dbResult = await client.query(
      `
      SELECT *
      FROM tv_watched
      WHERE user_id = $1
      ORDER BY time DESC LIMIT 20 OFFSET $2;
      `,
      [userId, (page * 20) | 0]
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
    await client.query(insert('tv_watched', wh as any));
    return watchedEpisodeInput;
  },

  async checkInEpisodeWithApiKey(
    apiKey: string,
    username: string,
    watchedEpisodeInput: Dragonstone.WatchedEpisode.InternalWatchedEpisodeInput,
    logger: Logger
  ): Promise<Dragonstone.WatchedEpisode.InternalWatchedEpisodeInput | null> {
    const userResult = await client.query(`SELECT id FROM users WHERE name = $1 AND api_key = $2 LIMIT 1`, [ username, apiKey ])
    if (userResult.rowCount === 0) {
      logger.warn(`Could not find user with apiKey: ${apiKey} and username ${username}`)
      return null;
    }
    const wh = mapWatchedInputToWatchedEpisode(watchedEpisodeInput, userResult.rows[0].id);
    await client.query(insert('tv_watched', wh as any));
    return watchedEpisodeInput;
  },

  async checkInEpisodes(
    userId: number,
    watchedEpisodeInputs: Dragonstone.WatchedEpisode.InternalWatchedEpisodeInput[]
  ): Promise<Dragonstone.WatchedEpisode.InternalWatchedEpisodeInput[]> {
    const wh = watchedEpisodeInputs.map(w => mapWatchedInputToWatchedEpisode(w, userId));
    await client.query(inserts('tv_watched', wh as any[]));
    return watchedEpisodeInputs;
  },

  async removeCheckedInEpisode(
    userId: number,
    unwatchedEpisodeInput: Dragonstone.WatchedEpisode.UnwatchedEpisodeInput
  ): Promise<Dragonstone.WatchedEpisode.UnwatchedEpisodeInput> {
    await client.query(`DELETE FROM tv_watched WHERE episodenumber = $1 AND show_id = $2 AND user_id = $3`, [
      unwatchedEpisodeInput.episodenumber,
      unwatchedEpisodeInput.showId,
      userId
    ]);
    return unwatchedEpisodeInput;
  }
});
