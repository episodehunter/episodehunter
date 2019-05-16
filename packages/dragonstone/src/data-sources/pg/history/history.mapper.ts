import { Dragonstone } from '@episodehunter/types';
import { FirebaseWatchedEpisode } from '../types';

export function mapWatchedEpisodes(episodes: FirebaseWatchedEpisode[]): Dragonstone.WatchedEpisode.WatchedEpisode[] {
  return episodes.map(mapWatchedEpisode) as Dragonstone.WatchedEpisode.WatchedEpisode[];
}

export function mapWatchedEpisode(episode?: FirebaseWatchedEpisode): Dragonstone.WatchedEpisode.WatchedEpisode | null {
  if (!episode) {
    return null;
  }
  return {
    episode: episode.episode,
    episodeNumber: episode.episodeNumber,
    season: episode.season,
    showId: String(episode.showId),
    time: episode.time,
    type: episode.type
  };
}
