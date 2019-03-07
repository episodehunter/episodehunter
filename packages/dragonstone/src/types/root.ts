import { gql } from 'apollo-server-lambda';
import { show } from './show';

export const root = gql`
  schema {
    query: RootQuery
  }

  type RootQuery {
    show(id: String!): Show
  }

  ${show}
`;
