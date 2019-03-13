import { Docs } from '../util/firebase-docs';
import { WatchedEpisode, UsermetaData } from '../types';
import { createDateString } from '../../../util/date';
import { safeMap } from '../../../util/util';

export function createSelectors(docs: Docs) {
  return {
    getHighestWatchedEpisode(userId: string, showId: string): Promise<WatchedEpisode | null> {
      return docs
        .showsWatchHistoryCollection(userId)
        .where('showId', '==', showId)
        .orderBy('episodeNumber', 'desc')
        .limit(1)
        .get()
        .then(r => {
          console.log('Real ' + r.size);
          if (r.size === 1 && r.docs[0].exists) {
            return r.docs[0].data() as WatchedEpisode;
          }
          return null;
        });
    },
    getNumberOfEpisodesAfter(showId: string, episodeNumber: number): Promise<number> {
      const dateString = createDateString(new Date());
      return docs
        .episodesCollection(showId)
        .where('episodeNumber', '>', episodeNumber)
        .orderBy('episodeNumber')
        .get()
        .then(querySnapshot => {
          let n = 0;
          let stop = false;
          querySnapshot.forEach(result => {
            if (stop) {
              return;
            } else if (result.data().aired <= dateString) {
              n++;
            } else {
              stop = true;
            }
          });
          return n;
        });
    },
    async getNumberOfEpisodesToWatch(userId: string, showId: string) {
      const highestWatchedEpisode = await this.getHighestWatchedEpisode(userId, showId);
      let nextNumber = 0;
      if (highestWatchedEpisode) {
        nextNumber = highestWatchedEpisode.episodeNumber;
      }
      return this.getNumberOfEpisodesAfter(showId, nextNumber);
    },
    async getUsermetadata(userId: string): Promise<UsermetaData> {
      const userMetadata = await docs
        .userDoc(userId)
        .get()
        .then(d => d.data() as UsermetaData | undefined);
      if (!userMetadata) {
        throw new Error('userMetadata do not exist for user ' + userId);
      }
      return userMetadata;
    },
    async getFollowingList(userId: string): Promise<string[]> {
      const userMetadata = await this.getUsermetadata(userId);
      return safeMap(userMetadata.following, String);
    }
  };
}

export type Selectors = ReturnType<typeof createSelectors>;
