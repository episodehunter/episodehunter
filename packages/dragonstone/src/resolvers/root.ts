import { Context } from '../context';
import { PublicTypes, Omit } from '../public';
import { dateType } from './date';
import { ApolloError, AuthenticationError } from 'apollo-server-lambda';

const RootQuery: RootQueryType = {
  following(root, args, context) {
    return context.firebaseResolver.user.getFollowing(context.getUid());
  },
  show(root, args, context) {
    return context.firebaseResolver.show.getShow(args.id);
  },
  upcomingEpisode(root, args, context) {
    return context.firebaseResolver.upcoming.getUpcomingEpisode(args.showIds);
  },
  nextEpisodeToWatch(root, args, context) {
    return context.firebaseResolver.episode.getNextEpisodeToWatch(context.getUid(), args.showId);
  },
  episodes(root, args, context) {
    return context.firebaseResolver.episode.getEpisodes(args.showId, args.season, args.episode);
  },
  watchedEpisodes(root, args, context) {
    return context.firebaseResolver.history.getWatchedEpisodesForShow(context.getUid(), args.showId);
  },
  whatToWatch(root, args, context) {
    return context.firebaseResolver.history.getWhatToWatch(context.getUid(), args.showId);
  },
  titles(root, args, context) {
    return context.firebaseResolver.titles.getTitles();
  },
  history(root, args, context) {
    return context.firebaseResolver.history.getHistoryPage(context.getUid(), Math.max(args.page, 0));
  }
};

const History: HistoryQueryType = {
  show(root, args, context) {
    return context.firebaseResolver.show.getShow(root.watchedEpisode.showId);
  },
  episode(root, args, context) {
    return context.firebaseResolver.episode.getEpisode(root.watchedEpisode.showId, root.watchedEpisode.episodeNumber);
  }
};

const RootMutation: RootMutationType = {
  checkInEpisode(root, args, context) {
    return context.firebaseResolver.history.checkInEpisode(context.getUid(), args.episode);
  },
  checkInEpisodes(root, args, context) {
    return context.firebaseResolver.history.checkInEpisodes(context.getUid(), args.episodes);
  },
  removeCheckedInEpisode(root, args, context) {
    return context.firebaseResolver.history.removeCheckedInEpisode(context.getUid(), args.episode);
  },
  followShow(root, args, context) {
    return context.firebaseResolver.user.followShow(context.getUid(), args.showId);
  },
  unfollowShow(root, args, context) {
    return context.firebaseResolver.user.unfollowShow(context.getUid(), args.showId);
  },
  updateTitles(root, args, context) {
    if (!context.usingApiKey) {
      throw new AuthenticationError('missing api key');
    }
    return context.firebaseResolver.titles.updateTitles();
  }
};

const resolverHandler = {
  get<R, A>(target: { [key: string]: (r: R, a: A, c: Context) => Promise<any> }, prop: string) {
    return (root: R, args: A, context: Context) => {
      return target[prop](root, args, context).catch(error => {
        context.logger.warn(`Reolver (${prop}) endeds with error: ${error}`);
        if (!(error instanceof ApolloError)) {
          context.logger.captureException(error);
        }
        return Promise.reject(error);
      });
    };
  }
};

export const resolvers = {
  Date: dateType,
  WatchedEnum: {
    kodiScrobble: 0,
    kodiSync: 1,
    checkIn: 2,
    checkInSeason: 3,
    plexScrobble: 4
  },
  RootQuery: new Proxy(RootQuery, resolverHandler),
  RootMutation: new Proxy(RootMutation, resolverHandler),
  History
};

type RootQueryType = {
  following: (root: void, args: {}, context: Context) => Promise<string[]>;
  show: (root: void, args: { id: string }, context: Context) => Promise<PublicTypes.Show | null>;
  upcomingEpisode: (
    root: void,
    args: { showIds: string[] },
    context: Context
  ) => Promise<PublicTypes.UpcomingEpisode[]>;
  nextEpisodeToWatch: (root: void, args: { showId: string }, context: Context) => Promise<PublicTypes.Episode | null>;
  episodes: (
    root: void,
    args: { showId: string; season?: number; episode?: number },
    context: Context
  ) => Promise<PublicTypes.Episode[]>;
  watchedEpisodes: (root: void, args: { showId: string }, context: Context) => Promise<PublicTypes.WatchedEpisode[]>;
  whatToWatch: (root: void, args: { showId?: string }, context: Context) => Promise<PublicTypes.WhatToWatch[]>;
  titles: (root: void, args: {}, context: Context) => Promise<PublicTypes.Title[]>;
  history: (
    root: void,
    args: { page: number },
    context: Context
  ) => Promise<Omit<PublicTypes.History, 'show' | 'episode'>[]>;
} & { [key: string]: (r: any, a: any, c: Context) => Promise<any> };

type HistoryQueryType = {
  show: (
    root: Omit<PublicTypes.History, 'show' | 'episode'>,
    args: {},
    context: Context
  ) => Promise<PublicTypes.Show | null>;
  episode: (
    root: Omit<PublicTypes.History, 'show' | 'episode'>,
    args: {},
    context: Context
  ) => Promise<PublicTypes.Episode | null>;
};

type RootMutationType = {
  checkInEpisode: (
    root: void,
    args: { episode: PublicTypes.WatchedEpisodeInput },
    context: Context
  ) => Promise<boolean>;
  checkInEpisodes: (
    root: void,
    args: { episodes: PublicTypes.WatchedEpisodeInput[] },
    context: Context
  ) => Promise<boolean>;
  removeCheckedInEpisode: (
    root: void,
    args: { episode: PublicTypes.UnwatchedEpisodeInput },
    context: Context
  ) => Promise<boolean>;
  followShow: (root: void, args: { showId: string }, context: Context) => Promise<boolean>;
  unfollowShow: (root: void, args: { showId: string }, context: Context) => Promise<boolean>;
  updateTitles: (root: void, args: {}, context: Context) => Promise<boolean>;
} & { [key: string]: (r: any, a: any, c: Context) => Promise<any> };
