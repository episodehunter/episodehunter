import { gql } from 'apollo-server-lambda';
import { show } from './show';
import { episode } from './episode';

export const root = gql`
  schema {
    query: RootQuery
  }

  type RootQuery {
    show(id: String!): Show
    season(showId: String!, season: Int!): [Episode]!
    upcomingEpisode(showId: String!): [Episode]!
    nextEpisodeToWatch(showId: String!): Episode
  }

  ${show}
  ${episode}
`;
