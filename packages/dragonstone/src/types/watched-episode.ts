import { gql } from 'apollo-server-lambda';

export const watchedEpisode = gql`
  type WatchedEpisode {
    episodenumber: Int!
    showId: Int!
    time: Timestamp!
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
    showId: Int!
    episodenumber: Int!
  }

  input WatchedEpisodeInput {
    showId: Int!
    episodenumber: Int!
    time: Timestamp!
    type: WatchedEnum
  }
`;
