import { gql } from 'apollo-server-lambda';

export const watchedEpisode = gql`
  type WatchedEpisode {
    episode: Int!
    episodeNumber: Int!
    season: Int!
    showId: ID!
    time: Date!
    type: WatchedEnum!
  }

  enum WatchedEnum {
    kodiScrobble
    kodiSync
    checkIn
    checkInSeason
    plexScrobble
  }

  input UnwatchedEpisodeInput {
    showId: ID!
    season: Int!
    episode: Int!
  }

  input WatchedEpisodeInput {
    showId: ID!
    season: Int!
    episode: Int!
    time: Date!
    type: WatchedEnum
  }
`;

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

export interface WatchedEpisodeInput extends UnwatchedEpisodeInput {
  time: Date;
}

export interface UnwatchedEpisodeInput {
  showId: string;
  season: number;
  episode: number;
  type?: WatchedEnum;
}
