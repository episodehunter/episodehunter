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
  scalar Date

  schema {
    query: RootQuery
    mutation: RootMutation
  }

  type RootQuery {
    following: [ID]
    show(id: ID!): Show
    episodes(showId: ID!, season: Int, episode: Int): [Episode]!
    upcomingEpisode(showIds: [ID]!): [UpcomingEpisode]!
    nextEpisodeToWatch(showId: ID!): Episode
    watchedEpisodes(showId: ID!): [WatchedEpisode]
    whatToWatch(showId: ID): [WhatToWatch]
    titles: [Title]
    history(page: Int!): [History]
    me: User
  }

  type RootMutation {
    checkInEpisode(episode: WatchedEpisodeInput!): Boolean
    checkInEpisodes(episodes: [WatchedEpisodeInput]!): Boolean
    removeCheckedInEpisode(episode: UnwatchedEpisodeInput!): Boolean
    followShow(showId: ID!): Boolean
    unfollowShow(showId: ID!): Boolean
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
