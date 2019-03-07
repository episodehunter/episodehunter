import { gql } from 'apollo-server-lambda';

export const episode = gql`
  type Episode {
    # Date as a sting: YYYY-MM-DD
    aired: String!
    # The episode number, eg. 5
    episode: Int!
    # The episode number, s*1000 + e
    episodeNumber: Int!
    # Unix timestamp of last update
    lastupdated: Int!
    name: String!
    overview: String!
    season: Int!
    tvdbId: Int!
  }
`;

export interface Episode {
  aired: string;
  episode: number;
  episodeNumber: number;
  lastupdated: number;
  name: string;
  overview: string;
  season: number;
  tvdbId: number;
}
