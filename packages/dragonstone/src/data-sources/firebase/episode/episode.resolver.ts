import { PublicTypes } from '../../../public';
import { Docs } from '../util/firebase-docs';
import { mapEpisode, mapEpisodes } from './episode.mapper';
import { Episode } from './episode.type';

export const createEpisodeResolver = (docs: Docs) => ({
  async getNextEpisodeToWatch(userId: string, showId: string): Promise<PublicTypes.Episode | null> {
    const highestWatchedEpisode = await docs
      .showsWatchHistoryCollection(userId)
      .where('showId', '==', Number(showId))
      .orderBy('episodeNumber', 'desc')
      .limit(1)
      .get()
      .then(r => {
        if (r.size === 1) {
          return r.docs[0].data() as Episode;
        }
        return null;
      });

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
  getSeason(showId: string, season: number): Promise<PublicTypes.Episode[]> {
    return docs
      .episodesCollection(showId)
      .where('season', '==', season)
      .get()
      .then(querySnapshot => {
        return mapEpisodes(querySnapshot.docs.map(d => d.data() as Episode).filter(Boolean));
      });
  }
});
