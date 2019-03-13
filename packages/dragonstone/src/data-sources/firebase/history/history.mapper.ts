import { PublicTypes } from '../../../public';
import { WatchedEpisode } from '../types';

export function mapWatchedEpisodes(episodes: WatchedEpisode[]): PublicTypes.WatchedEpisode[] {
  return episodes.map(mapWatchedEpisode) as PublicTypes.WatchedEpisode[];
}

export function mapWatchedEpisode(episode?: WatchedEpisode): PublicTypes.WatchedEpisode | null {
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
