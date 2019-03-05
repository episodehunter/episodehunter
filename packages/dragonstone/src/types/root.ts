import { gql } from 'apollo-server';
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
