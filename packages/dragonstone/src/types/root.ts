import { gql } from 'apollo-server-lambda';
import { episode } from './episode';
import { following } from './following';
import { history } from './history';
import { nextToWatch } from './next-to-watch';
import { show } from './show';
import { title } from './title';
import { user } from './user';
import { watchedEpisode } from './watched-episode';

export const root = gql`
  scalar Timestamp

  schema {
    query: RootQuery
    mutation: RootMutation
  }

  type RootQuery {
    show(id: Int!): Show
    season(showId: Int!, season: Int!): [Episode]!
    following: [Following!]!
    titles: [Title]!
    history(page: Int!): [History]!
    me: User
  }

  type RootMutation {
    checkInEpisode(episode: WatchedEpisodeInput!, apiKey: String, username: String): NextToWatch
    checkInEpisodes(episodes: [WatchedEpisodeInput]!): NextToWatch!
    removeCheckedInEpisode(episode: UnwatchedEpisodeInput!): NextToWatch!
    followShow(showId: Int!): Boolean
    unfollowShow(showId: Int!): Boolean
    createUser(metadata: UserInput!): Boolean
  }

  ${show}
  ${episode}
  ${watchedEpisode}
  ${title}
  ${history}
  ${user}
  ${following}
  ${nextToWatch}
`;
