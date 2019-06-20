import { gql } from 'apollo-server-lambda';

export const whatToWatch = gql`
  type WhatToWatch {
    showId: Int!
    show: Show!
    numberOfEpisodesToWatch: Int!
  }
`;
