import { gql } from 'apollo-server-lambda';
import { show } from './show';
import { episode } from './episode';
import { watchedEpisode } from './watched-episode';
import { whatToWatch } from './what-to-watch';
import { upcomingEpisode } from './upcoming-episode';

export const root = gql`
  scalar Date

  schema {
    query: RootQuery
    mutation: RootMutation
  }

  type RootQuery {
    following: [ID]
    show(id: ID!): Show
    season(showId: ID!, season: Int!): [Episode]!
    upcomingEpisode(showIds: [ID]!): [UpcomingEpisode]!
    nextEpisodeToWatch(showId: ID!): Episode
    watchedEpisodes(showId: ID!): [WatchedEpisode]
    whatToWatch(showId: ID): [WhatToWatch]
  }

  type RootMutation {
    checkInEpisode(episode: WatchedEpisodeInput!): Boolean
    checkInEpisodes(episodes: [WatchedEpisodeInput]!): Boolean
    removeCheckedInEpisode(episode: UnwatchedEpisodeInput!): Boolean
    followShow(showId: ID!): Boolean
    unfollowShow(showId: ID!): Boolean
  }

  ${show}
  ${episode}
  ${watchedEpisode}
  ${whatToWatch}
  ${upcomingEpisode}
`;
