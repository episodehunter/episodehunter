import { Dragonstone, ShowId } from '@episodehunter/types';
import { ValidationError } from 'apollo-server-lambda';
import { Client } from 'pg';
import { daysAgoOnFormatYYYYMMDD } from '../../../util/date';
import { PgEpisode } from '../types';
import { mapEpisode } from './episode.mapper';
import { UpcomingLoader } from './upcoming.loader';

export const createUpcomingResolver = (client: Client, upcomingLoader: UpcomingLoader) => ({
  async getUpcomingEpisode(showIds: number[]): Promise<Dragonstone.UpcomingEpisode[]> {
    if (showIds.length > 50) {
      throw new ValidationError('Exceeded maximum payload. You can ask for max 50 shows');
    }
    const uniqIds = Array.from(new Set(showIds.map(Number).filter(Boolean)));
    const day = daysAgoOnFormatYYYYMMDD(3, new Date());
    const dbResult = await client.query(
      `SELECT * FROM episodes WHERE show_id IN (${uniqIds.join(
        ', '
      )}) AND first_aired >= $1 ORDER BY episodenumber LIMIT 3`,
      [day]
    );
    const group: { [key: number]: Dragonstone.UpcomingEpisode } = {};
    for (let dbEpisode of dbResult.rows as PgEpisode[]) {
      group[dbEpisode.show_id] = group[dbEpisode.show_id] || {
        showId: dbEpisode.show_id,
        episodes: []
      };
      group[dbEpisode.show_id].episodes.push(mapEpisode(dbEpisode));
    }
    return Object.values(group);
  },

  async getUpcomingEpisode2(showId: ShowId): Promise<Dragonstone.Episode> {
    return upcomingLoader.load(showId).then(r => mapEpisode(r));
  }
});
