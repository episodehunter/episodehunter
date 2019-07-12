import { gql } from 'apollo-server-lambda';

export const following = gql`
  type Following {
    showId: Int!
    show: Show!
  }
`;
