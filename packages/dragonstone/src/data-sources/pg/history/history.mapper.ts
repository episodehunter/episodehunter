import { WatchedEpisodeInput, WatchedEpisode } from '@episodehunter/types/dragonstone-resolvers-types';
import { NewWatchedEpisodeRecord, WatchedEpisodeRecord } from '../schema';

export function mapWatchedEpisodes(episodes: WatchedEpisodeRecord[]): WatchedEpisode[] {
  return episodes.map(mapWatchedEpisode) as WatchedEpisode[];
}

export function mapWatchedEpisode(episode?: WatchedEpisodeRecord): WatchedEpisode | null {
  if (!episode) {
    return null;
  }
  return {
    episodenumber: episode.episodenumber,
    showId: episode.show_id,
    time: episode.time,
    type: episode.type
  };
}

export function mapWatchedInputToWatchedEpisode(
  input: WatchedEpisodeInput,
  userId: number
): NewWatchedEpisodeRecord {
  return {
    episodenumber: input.episodenumber,
    show_id: input.showId,
    type: input.type || 2,
    time: input.time,
    user_id: userId
  };
}
