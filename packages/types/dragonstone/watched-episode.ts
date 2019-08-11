import { ShowId } from '../types';

export const enum WatchedEnum {
  kodiScrobble = 0,
  kodiSync = 1,
  checkIn = 2,
  checkInSeason = 3,
  plexScrobble = 4
}

export interface WatchedEpisode {
  episodenumber: number;
  showId: ShowId;
  time: number;
  type: WatchedEnum;
}

export interface InternalWatchedEpisodeInput {
  showId: ShowId;
  episodenumber: number;
  type?: WatchedEnum;
  time: number;
}

export interface WatchedEpisodeInput extends UnwatchedEpisodeInput {
  time: number;
}

export interface UnwatchedEpisodeInput {
  showId: ShowId;
  episodenumber: number;
  type?: 'checkIn' | 'kodiScrobble' | 'kodiSync' | 'checkInSeason' | 'plexScrobble';
}
