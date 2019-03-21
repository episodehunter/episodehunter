import { PublicTypes } from '../../public';

export interface UsermetaData {
  apiKey: string;
  following: number[];
}

export enum WatchedEnum {
  kodiScrobble,
  kodiSync,
  checkIn,
  checkInSeason,
  plexScrobble
}

export interface WatchedEpisode {
  episode: number;
  episodeNumber: number;
  season: number;
  showId: string;
  time: Date;
  type: WatchedEnum;
}

export interface Title {
  id: string;
  name: string;
  followers: number;
  tvdbId: number;
}
