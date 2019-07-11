import { Dragonstone } from '@episodehunter/types';
import { WatchedEnum } from '@episodehunter/types/dragonstone/watched-episode';
import { PgWatchedEpisode } from '../types';

export function mapWatchedEpisodes(episodes: PgWatchedEpisode[]): Dragonstone.WatchedEpisode.WatchedEpisode[] {
  return episodes.map(mapWatchedEpisode) as Dragonstone.WatchedEpisode.WatchedEpisode[];
}

export function mapWatchedEpisode(episode?: PgWatchedEpisode): Dragonstone.WatchedEpisode.WatchedEpisode | null {
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
): PgWatchedEpisode {
  return {
    episodenumber: input.episodenumber,
    show_id: input.showId,
    type: input.type || WatchedEnum.checkIn,
    time: input.time,
    user_id: userId
  };
}
