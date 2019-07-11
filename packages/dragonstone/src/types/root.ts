import { gql } from 'apollo-server-lambda';
import { episode } from './episode';
import { history } from './history';
import { show } from './show';
import { title } from './title';
import { upcomingEpisode } from './upcoming-episode';
import { watchedEpisode } from './watched-episode';
import { whatToWatch } from './what-to-watch';
import { user } from './user';
import { following } from './following';

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

    # upcomingEpisode(showIds: [Int]!): [UpcomingEpisode]!
    # nextEpisodeToWatch(showId: Int!): Episode
    # watchedEpisodes(showId: Int!): [WatchedEpisode]!
    # whatToWatchForShow(showId: Int!): WhatToWatch!
    # whatToWatch: [WhatToWatch!]!

    titles: [Title]!
    history(page: Int!): [History]!
    me: User
  }

  type RootMutation {
    checkInEpisode(episode: WatchedEpisodeInput!): NextToWatch!
    checkInEpisodes(episodes: [WatchedEpisodeInput]!): NextToWatch!
    removeCheckedInEpisode(episode: UnwatchedEpisodeInput!): NextToWatch!
    followShow(showId: Int!): Boolean
    unfollowShow(showId: Int!): Boolean
    # updateTitles: Boolean
  }

  ${show}
  ${episode}
  ${watchedEpisode}
  ${whatToWatch}
  ${upcomingEpisode}
  ${title}
  ${history}
  ${user}
  ${following}
`;
