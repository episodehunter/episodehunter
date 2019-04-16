import { gql } from 'apollo-server-lambda';

export const upcomingEpisode = gql`
  type UpcomingEpisode {
    episodes: [Episode]!
    showId: ID!
  }
`;
