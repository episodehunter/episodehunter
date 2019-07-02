import { Dragonstone, ShowId } from '@episodehunter/types';
import { mapEpisode } from './episode.mapper';
import { UpcomingLoader } from './upcoming.loader';

export const createUpcomingResolver = (upcomingLoader: UpcomingLoader, justAirdLoader: UpcomingLoader) => ({
  async getUpcomingEpisode(showId: ShowId): Promise<Dragonstone.Episode | null> {
    return upcomingLoader.load(showId).then(r => mapEpisode(r));
  },

  async getJustAirdEpisode(showId: ShowId): Promise<Dragonstone.Episode | null> {
    return justAirdLoader.load(showId).then(r => mapEpisode(r));
  }
});
