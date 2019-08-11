import { gql } from 'apollo-server-lambda';

export const nextToWatch = gql`
  type NextToWatch {
    numberOfEpisodesToWatch: Int!
    episode: Episode
    madeMutation: Boolean!
  }
`;
