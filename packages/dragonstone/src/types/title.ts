import { gql } from 'apollo-server-lambda';

export const title = gql`
  type Title {
    id: ID
    name: String
    followers: Int
    tvdbId: Int
  }
`;

export interface Title {
  id: string;
  name: string;
  followers: number;
  tvdbId: number;
}
