import { gql } from 'apollo-server-lambda';

export const user = gql`
  type User {
    apikey: String!
    username: String!
    following: [String]!
  }
`;
