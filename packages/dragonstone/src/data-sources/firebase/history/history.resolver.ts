import { PublicTypes, Omit } from '../../../public';
import { Docs } from '../util/firebase-docs';
import { mapWatchedEpisodes } from './history.mapper';
import { WatchedEpisode, WatchedEnum } from '../types';
import { Selectors } from '../util/selectors';

export const createHistoryResolver = (docs: Docs, selectors: Selectors) => ({
  async getHistoryPage(userId: string, page: number): Promise<Omit<PublicTypes.History, 'show' | 'episode'>[]> {
    const historyPage = await docs
      .showsWatchHistoryCollection(userId)
      .orderBy('time', 'desc')
      .limit(20)
      .offset(page * 20)
      .get()
      .then(r => r.docs.map(d => d.data() as WatchedEpisode));
    return historyPage.map(watchedEpisode => ({ watchedEpisode }));
  },
  async getWatchedEpisodesForShow(userId: string, showId: string): Promise<PublicTypes.WatchedEpisode[]> {
    const highestWatchedEpisode = await docs
      .showsWatchHistoryCollection(userId)
      .where('showId', '==', showId)
      .get()
      .then(r => r.docs.map(d => d.data() as WatchedEpisode));
    return mapWatchedEpisodes(highestWatchedEpisode);
  },
  async getWhatToWatch(userId: string, showId?: string): Promise<PublicTypes.WhatToWatch[]> {
    let showIds: string[] = showId ? [showId] : [];
    if (!showIds.length) {
      showIds = await selectors.getFollowingList(userId);
    }
    return Promise.all(
      showIds.map(async showId => ({
        numberOfEpisodesToWatch: await selectors.getNumberOfEpisodesToWatch(userId, showId),
        showId
      }))
    );
  },
  async checkInEpisode(userId: string, watchedEpisodeInput: PublicTypes.WatchedEpisodeInput): Promise<boolean> {
    const wh = {
      episode: watchedEpisodeInput.episode,
      episodeNumber: watchedEpisodeInput.season * 10000 + watchedEpisodeInput.episode,
      season: watchedEpisodeInput.season,
      showId: watchedEpisodeInput.showId,
      time: watchedEpisodeInput.time,
      type: watchedEpisodeInput.type || WatchedEnum.checkIn
    };
    return docs
      .showsWatchHistoryCollection(userId)
      .add(wh)
      .then(() => true);
  },
  async checkInEpisodes(userId: string, watchedEpisodeInputs: PublicTypes.WatchedEpisodeInput[]): Promise<boolean> {
    return Promise.all(watchedEpisodeInputs.map(e => this.checkInEpisode(userId, e))).then(() => true);
  },
  async removeCheckedInEpisode(
    userId: string,
    unwatchedEpisodeInput: PublicTypes.UnwatchedEpisodeInput
  ): Promise<boolean> {
    const episodeNumber = unwatchedEpisodeInput.season * 10000 + unwatchedEpisodeInput.episode;
    return docs
      .showsWatchHistoryCollection(userId)
      .where('showId', '==', unwatchedEpisodeInput.showId)
      .where('episodeNumber', '==', episodeNumber)
      .get()
      .then(result => {
        return result.docs.filter(d => d.exists).map(d => d.ref.delete());
      })
      .then(() => true);
  }
});
