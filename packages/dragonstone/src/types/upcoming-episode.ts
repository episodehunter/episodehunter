import { gql } from 'apollo-server-lambda';
import { Episode } from './episode';

export const upcomingEpisode = gql`
  type UpcomingEpisode {
    episodes: [Episode]!
    showId: ID!
  }
`;

export interface UpcomingEpisode {
  showId: string;
  episodes: Episode[];
}
