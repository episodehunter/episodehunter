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
