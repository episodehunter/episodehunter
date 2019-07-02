import { gql } from 'apollo-server-lambda';

export const following = gql`
  type Following {
    showId: Int!
    show: Show!
    upcomingEpisode: Episode
    nextToWatch: NextToWatch!
  }

  type NextToWatch {
    numberOfEpisodesToWatch: Int!
    episode: Episode
  }
`;
