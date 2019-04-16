import { Dragonstone } from '@episodehunter/types';
import { ValidationError } from 'apollo-server-lambda';
import { daysAgoOnFormatYYYYMMDD } from '../../../util/date';
import { Episode } from '../types';
import { Docs } from '../util/firebase-docs';
import { mapEpisodes } from './episode.mapper';

export const createUpcomingResolver = (docs: Docs) => ({
  async getUpcomingEpisode(showIds: string[]): Promise<Dragonstone.UpcomingEpisode[]> {
    if (showIds.length > 50) {
      throw new ValidationError('Exceeded maximum payload. You can ask for max 50 shows');
    }
    const uniqIds = Array.from(new Set(showIds));
    return Promise.all(
      uniqIds.map(id =>
        docs
          .episodesCollection(id)
          .where('aired', '>=', daysAgoOnFormatYYYYMMDD(3, new Date()))
          .orderBy('aired')
          .limit(3)
          .get()
          .then(querySnapshot => ({
            showId: id,
            episodes: mapEpisodes(querySnapshot.docs.map(d => d.data() as Episode))
          }))
      )
    );
  }
});
