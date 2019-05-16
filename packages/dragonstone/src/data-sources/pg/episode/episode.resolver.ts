import { Logger } from '@episodehunter/logger';
import { Dragonstone, Message } from '@episodehunter/types';
import { Query } from '@google-cloud/firestore';
import { calculateEpisodeNumber } from '../../../util/util';
import { FirebaseEpisode } from '../types';
import { Docs } from '../util/firebase-docs';
import { Selectors } from '../util/selectors';
import { createBatch } from '../util/util';
import { mapEpisode, mapEpisodeInputToEpisode, mapEpisodes } from './episode.mapper';

export const createEpisodeResolver = (docs: Docs, selectors: Selectors) => ({
  async getNextEpisodeToWatch(userId: string, showId: string): Promise<Dragonstone.Episode | null> {
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
          return mapEpisode(querySnapshot.docs[0].data() as FirebaseEpisode);
        } else {
          return null;
        }
      });
  },
  async getEpisodes(showId: string, season?: number, episode?: number): Promise<Dragonstone.Episode[]> {
    let query: Query = docs.episodesCollection(showId);
    if (typeof season === 'number') {
      query = query.where('season', '==', season);
    }
    if (typeof episode === 'number') {
      query = query.where('episode', '==', season);
    }
    return query.get().then(querySnapshot => {
      return mapEpisodes(querySnapshot.docs.map(d => d.data() as FirebaseEpisode).filter(Boolean));
    });
  },
  async getEpisode(showId: string, episodeNumber: number): Promise<FirebaseEpisode | null> {
    return docs
      .episodesCollection(showId)
      .where('episodeNumber', '==', episodeNumber)
      .get()
      .then(querySnapshot => {
        if (querySnapshot.empty) {
          return null;
        } else {
          return querySnapshot.docs[0].data() as FirebaseEpisode;
        }
      });
  },
  async updateEpisodes(
    showId: string,
    first: number,
    last: number,
    episodes: Message.Dragonstone.UpdateEpisodes.EpisodeInput[],
    logger: Logger
  ): Promise<boolean> {
    const currentShowDoc = await docs.showDoc(showId).get();
    if (!currentShowDoc.exists) {
      logger.log(`Show with id "${showId}" do not exist. Do not update episodes.`);
      return false;
    }
    const batch = createBatch(docs.db);
    logger.log(`Start updating show with id: ${showId}. ${episodes.length} number of episodes`);

    const episodeCollection = await docs
      .episodesCollection(showId)
      .where('episodeNumber', '>=', first)
      .where('episodeNumber', '<=', last)
      .get();
    const knownEpisodes = new Set<number>();

    // See if we should update or remove any existed episodes
    for (let doc of episodeCollection.docs) {
      const currentEpisode = doc.data() as FirebaseEpisode;
      const newEpisode = episodes.find(e => e.season === currentEpisode.season && e.episode === currentEpisode.episode);
      knownEpisodes.add(currentEpisode.episodeNumber);
      if (!newEpisode) {
        await batch.delete(doc.ref);
      } else if (currentEpisode.lastupdated < newEpisode.lastupdated) {
        const mappedEpisode = mapEpisodeInputToEpisode(newEpisode);
        await batch.set(doc.ref, mappedEpisode);
      }
    }

    // Check if we should add any new episodes
    for (let episode of episodes) {
      const episodeNumber = calculateEpisodeNumber(episode.season, episode.episode);
      if (knownEpisodes.has(episodeNumber)) {
        continue;
      }
      const mappedEpisode = mapEpisodeInputToEpisode(episode);
      const docRef = docs.episodesCollection(showId).doc(`S${episode.season}E${episode.episode}`);
      await batch.set(docRef, mappedEpisode);
    }
    await batch.commit();
    const stat = batch.getStat();
    logger.log(`Done with updating episodes for show with id: ${showId}. ${stat}`);
    return true;
  }
});
