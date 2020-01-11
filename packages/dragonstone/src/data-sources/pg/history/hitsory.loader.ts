import { sql } from 'squid/pg';
import { PgClient } from '../../../util/pg';
import { WatchedEpisodeRecord } from '../schema';
import { createDataLoader, DataLoader } from '../util/data-loader';

interface Key {
  userId: number;
  showId: number;
  episodenumber: number;
}

export function createHistoryLoader(client: PgClient): HistoryLoader {
  const getBatchUpcoming = async (keys: readonly Key[]): Promise<WatchedEpisodeRecord[][]> => {
    const showId = keys[0].showId | 0;
    const userId = keys[0].userId | 0;
    const uniqIds = Array.from(new Set(keys.map(key => Number(key.episodenumber)).filter(Boolean)));

    if (uniqIds.length === 0) {
      return keys.map(() => []);
    }

    const dbRerult = await client.query<WatchedEpisodeRecord>(sql`
      SELECT *
      FROM tv_watched
      WHERE user_id=${userId} AND show_id=${showId} AND episodenumber IN (${sql.raw(uniqIds.join(','))});`);

    return keys.map(key => {
      return dbRerult.rows.filter(row => row.episodenumber === key.episodenumber);
    });
  };

  return createDataLoader<Key, WatchedEpisodeRecord[]>(getBatchUpcoming);
}

export type HistoryLoader = DataLoader<Key, WatchedEpisodeRecord[]>;
