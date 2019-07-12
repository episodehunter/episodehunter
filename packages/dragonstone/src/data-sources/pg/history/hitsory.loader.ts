import DataLoader from 'dataLoader';
import { Client } from 'pg';
import { PgWatchedEpisode } from '../pg-types';

interface Key {
  userId: number;
  showId: number;
  episodenumber: number;
}

export function createHistoryLoader(client: Client): HistoryLoader {
  const getBatchUpcoming = async (keys: Key[]): Promise<PgWatchedEpisode[][]> => {
    const showId = keys[0].showId | 0;
    const userId = keys[0].userId | 0;
    const uniqIds = Array.from(new Set(keys.map(key => Number(key.episodenumber)).filter(Boolean)));

    if (uniqIds.length === 0) {
      return keys.map(() => []);
    }

    const dbRerult = await client.query(
      `
      SELECT *
      FROM tv_watched
      WHERE user_id = $1 AND show_id = $2 AND episodenumber IN (${uniqIds.join(',')});
      `,
      [userId, showId]
    );

    return keys.map(key => {
      return dbRerult.rows.filter(row => row.episodenumber === key.episodenumber);
    });
  };

  return new DataLoader<Key, PgWatchedEpisode[]>(getBatchUpcoming);
}

export type HistoryLoader = DataLoader<Key, PgWatchedEpisode[]>;
