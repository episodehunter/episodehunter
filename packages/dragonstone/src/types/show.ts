import { gql } from 'apollo-server-lambda';

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
`;
