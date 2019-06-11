import { gql } from 'apollo-server-lambda';

export const title = gql`
  type Title {
    id: Int!
    name: String
    followers: Int
    tvdbId: Int
    lastupdated: Int
  }
`;
