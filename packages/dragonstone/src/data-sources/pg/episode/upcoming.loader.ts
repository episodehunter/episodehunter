import { ShowId } from '@episodehunter/types';
import { daysAgoOnFormatYYYYMMDD } from '@episodehunter/utils';
import { sql } from 'squid/pg';
import { PgClient } from '../../../util/pg';
import { EpisodeRecord } from '../schema';
import { createDataLoader, DataLoader } from '../util/data-loader';

export function createUpcomingLoader(client: PgClient): UpcomingLoader {
  const getBatchUpcoming = async (showIds: ShowId[]): Promise<(EpisodeRecord | null)[]> => {
    const uniqIds = Array.from(new Set(showIds.map(Number).filter(Boolean)));
    const day = daysAgoOnFormatYYYYMMDD(0, new Date());

    if (uniqIds.length === 0) {
      return showIds.map(() => null);
    }

    const ids = uniqIds.join(', ');

    const dbRerult = await client.query<EpisodeRecord>(sql`
      SELECT * FROM (
        SELECT episodes.show_id, MIN(episodes.episodenumber) as episodenumber
        FROM episodes
        WHERE show_id IN (${sql.raw(ids)}) AND first_aired >= ${day} GROUP BY episodes.show_id
      ) as i JOIN episodes as e ON e.show_id = i.show_id AND e.episodenumber = i.episodenumber;
    `);

    return showIds.map(showId => {
      return dbRerult.rows.find(row => row.show_id === showId) || null;
    });
  };

  return createDataLoader<ShowId, EpisodeRecord | null>(getBatchUpcoming);
}

export function createJustAirdLoader(client: PgClient): UpcomingLoader {
  const getBatchUpcoming = async (showIds: ShowId[]): Promise<(EpisodeRecord | null)[]> => {
    const uniqIds = Array.from(new Set(showIds.map(Number).filter(Boolean)));
    const day = daysAgoOnFormatYYYYMMDD(3, new Date());
    const today = daysAgoOnFormatYYYYMMDD(0, new Date());

    if (uniqIds.length === 0) {
      return showIds.map(() => null);
    }

    const dbRerult = await client.query<EpisodeRecord>(sql`
      SELECT * FROM (
        SELECT episodes.show_id, MIN(episodes.episodenumber) as episodenumber
        FROM episodes
        WHERE show_id IN (${uniqIds.join(
          ', '
        )}) AND first_aired >= ${day} AND first_aired < ${today} GROUP BY episodes.show_id
      ) as i JOIN episodes as e ON e.show_id = i.show_id AND e.episodenumber = i.episodenumber;
    `);

    return showIds.map(showId => {
      return dbRerult.rows.find(row => row.show_id === showId) || null;
    });
  };

  return createDataLoader<ShowId, EpisodeRecord | null>(getBatchUpcoming);
}
export type UpcomingLoader = DataLoader<ShowId, EpisodeRecord | null>;
