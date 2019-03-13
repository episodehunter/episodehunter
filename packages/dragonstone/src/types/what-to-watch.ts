import { gql } from 'apollo-server-lambda';

export const whatToWatch = gql`
  type WhatToWatch {
    showId: ID!
    numberOfEpisodesToWatch: Int!
  }
`;

export interface WhatToWatch {
  showId: string;
  numberOfEpisodesToWatch: number;
}
