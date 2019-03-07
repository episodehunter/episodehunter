import { PublicTypes } from '../../../public';
import { Docs } from '../util/firebase-docs';
import { mapEpisodes } from './episode.mapper';
import { Episode } from './episode.type';
import { daysAgoOnFormatYYYYMMDD } from '../../../util/date';

export const createUpcomingResolver = (docs: Docs) => ({
  async getUpcomingEpisode(showId: string): Promise<PublicTypes.Episode[]> {
    return docs
      .episodesCollection(showId)
      .where('aired', '>=', daysAgoOnFormatYYYYMMDD(3, new Date()))
      .orderBy('aired')
      .limit(3)
      .get()
      .then(querySnapshot =>
        mapEpisodes(querySnapshot.docs.map(d => d.data() as Episode))
      );
  }
});
