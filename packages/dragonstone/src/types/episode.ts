import { gql } from 'apollo-server-lambda';

export const episode = gql`
  type Episode {
    ids: EpisodeIds
    # Date as a sting: YYYY-MM-DD
    aired: String!
    # The episode number, s*10000 + e
    episodenumber: Int!
    # Unix timestamp of last update
    lastupdated: Int!
    name: String!
    overview: String
    watched: [WatchedEpisode]!
  }

  type EpisodeIds {
    showId: Int!
    tvdb: Int!
  }
`;
