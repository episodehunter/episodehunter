import { gql } from 'apollo-server-lambda';
import { EpisodeInput } from './episode';

export const show = gql`
  type Show {
    airs: ShowAirs!
    ended: Boolean!
    genre: [String]!
    ids: ShowIds!
    language: String
    lastupdated: Int!
    name: String!
    network: String
    numberOfFollowers: Int!
    overview: String
    runtime: Int!
  }

  type ShowAirs {
    # Fisrt aird date, eg. "2007-02-26"
    first: String
    # Air time (local time), eg. "20:00"
    time: String
    # Day in week (0 = Monday...)
    day: Int
  }

  type ShowIds {
    id: String!
    imdb: String
    tvdb: Int!
  }

  input ShowInput {
    tvdbId: Int!
    imdbId: String
    name: String!
    airsDayOfWeek: Int
    airsTime: String
    firstAired: String
    genre: [String]!
    language: String
    network: String
    overview: String
    runtime: Int!
    ended: Boolean!
    lastupdate: Int!
    episodes: [EpisodeInput]!
  }
`;

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

export interface ShowInput {
  tvdbId: number;
  imdbId?: string;
  name: string;
  airsDayOfWeek?: number;
  airsTime?: string;
  firstAired?: string;
  genre: string[];
  language?: string;
  network?: string;
  overview?: string;
  runtime: number;
  ended: boolean;
  lastupdate: number;
  episodes: EpisodeInput[];
}
