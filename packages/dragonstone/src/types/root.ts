import { gql } from 'apollo-server-lambda';
import { episode } from './episode';
import { history } from './history';
import { show } from './show';
import { title } from './title';
import { upcomingEpisode } from './upcoming-episode';
import { watchedEpisode } from './watched-episode';
import { whatToWatch } from './what-to-watch';
import { user } from './user';

export const root = gql`
  scalar Timestamp

  schema {
    query: RootQuery
    mutation: RootMutation
  }

  type RootQuery {
    following: [Int!]!
    show(id: Int!): Show
    season(showId: Int!, season: Int!): [Episode]!
    upcomingEpisode(showIds: [Int]!): [UpcomingEpisode]!
    nextEpisodeToWatch(showId: Int!): Episode
    watchedEpisodes(showId: Int!): [WatchedEpisode]!
    whatToWatch(showId: Int!): [WhatToWatch]!
    titles: [Title]!
    history(page: Int!): [History]!
    me: User
  }

  type RootMutation {
    checkInEpisode(episode: WatchedEpisodeInput!): WatchedEpisode
    checkInEpisodes(episodes: [WatchedEpisodeInput]!): [WatchedEpisode]!
    removeCheckedInEpisode(episode: UnwatchedEpisodeInput!): Boolean
    followShow(showId: Int!): Boolean
    unfollowShow(showId: Int!): Boolean
    updateTitles: Boolean
  }

  ${show}
  ${episode}
  ${watchedEpisode}
  ${whatToWatch}
  ${upcomingEpisode}
  ${title}
  ${history}
  ${user}
`;
