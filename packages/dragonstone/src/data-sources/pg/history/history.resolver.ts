import { Dragonstone, ShowId, Omit } from '@episodehunter/types';
import { Client } from 'pg';
import { dateFormat } from '../../../util/util';
import { insert, inserts } from '../util/pg-util';
import { mapWatchedEpisode, mapWatchedEpisodes, mapWatchedInputToWatchedEpisode } from './history.mapper';
import { NumberOfEpisodesToWatchLoader, NumberOfEpisodesToWatch } from './number-of-episodes-to-watch.loader';

export const createHistoryResolver = (
  client: Client,
  numberOfEpisodesToWatchLoader: NumberOfEpisodesToWatchLoader
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
  async getWatchedEpisodesForShow(
    userId: number,
    showId: ShowId
  ): Promise<Dragonstone.WatchedEpisode.WatchedEpisode[]> {
    const dbResult = await client.query(
      `
      SELECT *
      FROM tv_watched
      WHERE user_id = $1 AND show_id = $2;
      `,
      [userId, showId]
    );
    return mapWatchedEpisodes(dbResult.rows);
  },
  async getNumberOfEpisodesToWatchForShow(
    userId: number,
    showId: number
  ): Promise<Omit<Dragonstone.ShowToWatch, 'show'>> {
    const dbResult = await client.query(
      `
      SELECT COUNT(*) as c
      FROM episodes as e
      WHERE
        e.show_id = $1 AND
        e.first_aired <= $2 AND
        NOT EXISTS (SELECT 1 FROM tv_watched as w WHERE w.user_id = $3 AND w.show_id = $1 AND w.episodenumber = e.episodenumber);
      `,
      [showId, dateFormat(), userId]
    );
    return {
      numberOfEpisodesToWatch: dbResult.rows[0].c | 0,
      showId
    };
  },
  async getNumberOfEpisodesToWatchForShow2(userId: number, showId: number): Promise<NumberOfEpisodesToWatch> {
    return numberOfEpisodesToWatchLoader.load({ userId, showId });
  },
  async getNumberOfEpisodesToWatch(userId: number): Promise<Omit<Dragonstone.ShowToWatch, 'show'>[]> {
    const dbResult = await client.query(
      `
      SELECT COUNT(*) as c, e.show_id
      FROM following as f
      LEFT JOIN episodes as e ON e.first_aired <= $1 AND f.show_id = e.show_id
      WHERE user_id = $2 AND NOT EXISTS (SELECT 1 FROM tv_watched as w WHERE w.user_id = $2 AND w.show_id = f.show_id AND w.episodenumber = e.episodenumber)
      GROUP BY e.show_id
      `,
      [dateFormat(), userId]
    );
    return dbResult.rows.map(row => ({
      numberOfEpisodesToWatch: row.c | 0,
      showId: row.show_id | 0
    }));
  },
  async checkInEpisode(
    userId: number,
    watchedEpisodeInput: Dragonstone.WatchedEpisode.WatchedEpisodeInput
  ): Promise<Dragonstone.WatchedEpisode.WatchedEpisode | null> {
    const wh = mapWatchedInputToWatchedEpisode(watchedEpisodeInput, userId);
    const dbResult = await client.query(insert('tv_watched', wh as any));
    if (dbResult.rowCount === 1) {
      return mapWatchedEpisode(dbResult.rows[0]);
    } else {
      return null;
    }
  },
  async checkInEpisodes(
    userId: number,
    watchedEpisodeInputs: Dragonstone.WatchedEpisode.WatchedEpisodeInput[]
  ): Promise<Dragonstone.WatchedEpisode.WatchedEpisode[]> {
    const wh = watchedEpisodeInputs.map(w => mapWatchedInputToWatchedEpisode(w, userId));
    const dbResult = await client.query(inserts('tv_watched', wh as any[]));
    return mapWatchedEpisodes(dbResult.rows);
  },

  async removeCheckedInEpisode(
    userId: number,
    unwatchedEpisodeInput: Dragonstone.WatchedEpisode.UnwatchedEpisodeInput
  ): Promise<boolean> {
    await client.query(`DELETE FROM tv_watched WHERE episodenumber = $1 AND show_id = $2 AND user_id = $3`, [
      unwatchedEpisodeInput.episodenumber,
      unwatchedEpisodeInput.showId,
      userId
    ]);
    return true;
  }
});
