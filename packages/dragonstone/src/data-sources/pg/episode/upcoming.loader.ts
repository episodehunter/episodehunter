import { Client } from 'pg';
import DataLoader from 'dataLoader';
import { PgEpisode } from '../types';
import { ShowId } from '@episodehunter/types';
import { daysAgoOnFormatYYYYMMDD } from '../../../util/date';

export function createUpcomingLoader(client: Client): UpcomingLoader {
  const getBatchUpcoming = async (showIds: ShowId[]): Promise<PgEpisode[]> => {
    const uniqIds = Array.from(new Set(showIds.map(Number).filter(Boolean)));
    const day = daysAgoOnFormatYYYYMMDD(3, new Date());

    const dbRerult = await client.query(
      `
      SELECT * FROM (
        SELECT episodes.show_id, MIN(episodes.episodenumber) as episodenumber
        FROM episodes
        WHERE show_id IN (${uniqIds.join(', ')}) AND first_aired >= $1 GROUP BY episodes.show_id
      ) as i JOIN episodes as e ON e.show_id = i.show_id AND e.episodenumber = i.episodenumber;
    `,
      [day]
    );

    return showIds.map(showId => {
      return dbRerult.rows.find(row => row.show_id === showId) || null;
    });
  };

  return new DataLoader<ShowId, PgEpisode>(getBatchUpcoming);
}

export type UpcomingLoader = DataLoader<ShowId, PgEpisode>;
