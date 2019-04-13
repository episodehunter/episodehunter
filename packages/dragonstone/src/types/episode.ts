import { gql } from 'apollo-server-lambda';

export const episode = gql`
  type Episode {
    # Date as a sting: YYYY-MM-DD
    aired: String!
    # The episode number, eg. 5
    episode: Int!
    # The episode number, s*10000 + e
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
  overview?: string;
  season: number;
  tvdbId: number;
}

export interface EpisodeInputBatch {
  showId: string;
  firstEpisode: number; // episodenumber
  lastEpisode: number; // episodenumber
  episodes: EpisodeInput[];
}

export interface EpisodeInput {
  tvdbId: number;
  name: string;
  season: number;
  episode: number;
  firstAired: string;
  overview?: string;
  lastupdated: number;
}
