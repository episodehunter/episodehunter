import { gql } from 'apollo-server';

export const show = gql`
  type Show {
    airs: ShowAirs!,
    ended: Boolean!,
    genre: [String]!,
    ids: ShowIds!,
    language: String,
    lastupdated: Int!,
    name: String!,
    network: String,
    numberOfFollowers: Int!,
    overview: String!,
    runtime: Int!,
    seasons: [Int]!,
    totalNumberOfEpisodes: Int!
  }

  type ShowAirs {
    # Fisrt aird date, eg. "2007-02-26"
    first: String
    # Air time (local time), eg. "20:00"
    time: String
  }

  type ShowIds {
    id: String!,
    imdb: String,
    tvdb: Int!
  }
`;

export interface Show {
  airs: {
    first?: string,
    time?: string
  },
  ended: boolean,
  genre: string[],
  ids: {
    id: string,
    imdb?: string,
    tvdb: number
  },
  language?: string,
  lastupdated: number,
  name: string,
  network?: string,
  numberOfFollowers: number,
  overview: string,
  runtime: number,
  seasons: number[],
  totalNumberOfEpisodes: number
}
