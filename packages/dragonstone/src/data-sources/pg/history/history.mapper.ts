import { Dragonstone } from '@episodehunter/types';
import { WatchedEnum } from '@episodehunter/types/dragonstone/watched-episode';
import { WatchedEpisodeRecord, NewWatchedEpisodeRecord } from '../schema';

export function mapWatchedEpisodes(episodes: WatchedEpisodeRecord[]): Dragonstone.WatchedEpisode.WatchedEpisode[] {
  return episodes.map(mapWatchedEpisode) as Dragonstone.WatchedEpisode.WatchedEpisode[];
}

export function mapWatchedEpisode(episode?: WatchedEpisodeRecord): Dragonstone.WatchedEpisode.WatchedEpisode | null {
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
  input: Dragonstone.WatchedEpisode.InternalWatchedEpisodeInput,
  userId: number
): NewWatchedEpisodeRecord {
  return {
    episodenumber: input.episodenumber,
    show_id: input.showId,
    type: input.type || WatchedEnum.checkIn,
    time: input.time,
    user_id: userId
  };
}
