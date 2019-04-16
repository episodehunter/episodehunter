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

export interface Episode {
  aired: string;
  episode: number;
  episodeNumber: number;
  lastupdated: number;
  name: string;
  overview?: string;
  season: number;
  tvdbId: number;
}

export interface Show {
  airs: {
    first?: string;
    time?: string;
    day?: number;
  };
  ended: boolean;
  genre: string[];
  ids: {
    id: string;
    imdb?: string;
    tvdb: number;
  };
  language?: string;
  lastupdated: number;
  name: string;
  network?: string;
  numberOfFollowers: number;
  overview?: string;
  runtime: number;
}
