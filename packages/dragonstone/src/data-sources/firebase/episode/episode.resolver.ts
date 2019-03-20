import { PublicTypes } from '../../../public';
import { Docs } from '../util/firebase-docs';
import { mapEpisode, mapEpisodes } from './episode.mapper';
import { Episode } from './episode.type';
import { Selectors } from '../util/selectors';
import { Query } from '@google-cloud/firestore';

export const createEpisodeResolver = (docs: Docs, selectors: Selectors) => ({
  async getNextEpisodeToWatch(userId: string, showId: string): Promise<PublicTypes.Episode | null> {
    const highestWatchedEpisode = await selectors.getHighestWatchedEpisode(userId, showId);

    let nextEpisode = 0;
    if (highestWatchedEpisode) {
      nextEpisode = highestWatchedEpisode.episodeNumber;
    }

    return docs
      .episodesCollection(showId)
      .where('episodeNumber', '>', nextEpisode)
      .orderBy('episodeNumber')
      .limit(1)
      .get()
      .then(querySnapshot => {
        if (querySnapshot.size === 1) {
          return mapEpisode(querySnapshot.docs[0].data() as Episode);
        } else {
          return null;
        }
      });
  },
  async getEpisodes(showId: string, season?: number, episode?: number): Promise<PublicTypes.Episode[]> {
    let query: Query = docs.episodesCollection(showId);
    if (typeof season === 'number') {
      query = query.where('season', '==', season);
    }
    if (typeof episode === 'number') {
      query = query.where('episode', '==', season);
    }
    return query.get().then(querySnapshot => {
      return mapEpisodes(querySnapshot.docs.map(d => d.data() as Episode).filter(Boolean));
    });
  },
  async getEpisode(showId: string, episodeNumber: number): Promise<Episode | null> {
    return docs
      .episodesCollection(showId)
      .where('episodeNumber', '==', episodeNumber)
      .get()
      .then(querySnapshot => {
        if (querySnapshot.empty) {
          return null;
        } else {
          return querySnapshot.docs[0].data() as Episode;
        }
      });
  }
});
