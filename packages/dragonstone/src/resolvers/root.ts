import { Dragonstone, Omit, ShowId } from '@episodehunter/types';
import { ApolloError } from 'apollo-server-lambda';
import { Context } from '../context';
import { unixTimestampType } from './timestamp';
import { Following as FollowingType, NextToWatch } from './type';
import { History } from '@episodehunter/types/dragonstone';

const RootQuery: RootQueryType = {
  async following(root, args, context) {
    return context.pgResolver.user.getFollowing(context.getUid());
  },
  show(root, args, context) {
    return context.pgResolver.show.getShow(args.id);
  },
  upcomingEpisode(root, args, context) {
    return context.pgResolver.upcoming.getUpcomingEpisode(args.showIds);
  },
  async nextEpisodeToWatch(root, args, context) {
    return context.pgResolver.episode.getNextEpisodeToWatch(context.getUid(), args.showId);
  },
  season(root, args, context) {
    return context.pgResolver.episode.getSeasonEpisodes(args.showId, args.season);
  },
  async watchedEpisodes(root, args, context) {
    return context.pgResolver.history.getWatchedEpisodesForShow(context.getUid(), args.showId);
  },
  async whatToWatchForShow(root, args, context) {
    return context.pgResolver.history.getNumberOfEpisodesToWatchForShow(context.getUid(), args.showId);
  },
  async whatToWatch(root, args, context) {
    return context.pgResolver.history.getNumberOfEpisodesToWatch(context.getUid());
  },
  titles(root, args, context) {
    return context.pgResolver.titles.getTitles();
  },
  async history(root, args, context): Promise<Pick<History, 'watchedEpisode'>[]> {
    const result = await context.pgResolver.history.getHistoryPage(context.getUid(), Math.max(args.page, 0));
    return result.map(watchedEpisode => ({ watchedEpisode }));
  },
  async me(root, args, context) {
    const result = await context.pgResolver.user.getUser(context.getUid());
    if (!result) {
      throw new ApolloError('User do not exist');
    }
    return result;
  }
};

const History: HistoryQueryType = {
  show(root, args, context) {
    return context.pgResolver.show.getShow(root.watchedEpisode.showId);
  },
  episode(root, args, context) {
    return context.pgResolver.episode.getEpisode(root.watchedEpisode.showId, root.watchedEpisode.episodenumber);
  }
};

const WhatToWatch: WhatToWatch = {
  show(root, args, context) {
    return context.pgResolver.show.getShow(root.showId);
  }
};

const Following: FollowingQueryType = {
  show(root, args, context) {
    return context.pgResolver.show.getShow(root.showId);
  },
  upcomingEpisode(root, args, context) {
    return context.pgResolver.upcoming.getUpcomingEpisode2(root.showId);
  },
  async nextToWatch(root, args, context) {
    return context.pgResolver.history.getNumberOfEpisodesToWatchForShow2(context.getUid(), root.showId);
  }
};

const RootMutation: RootMutationType = {
  async checkInEpisode(root, args, context) {
    return context.pgResolver.history.checkInEpisode(context.getUid(), args.episode);
  },
  async checkInEpisodes(root, args, context) {
    return context.pgResolver.history.checkInEpisodes(context.getUid(), args.episodes);
  },
  async removeCheckedInEpisode(root, args, context) {
    return context.pgResolver.history.removeCheckedInEpisode(context.getUid(), args.episode);
  },
  async followShow(root, args, context) {
    return context.pgResolver.user.followShow(context.getUid(), args.showId);
  },
  async unfollowShow(root, args, context) {
    return context.pgResolver.user.unfollowShow(context.getUid(), args.showId);
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
  Timestamp: unixTimestampType,
  WatchedEnum: {
    kodiScrobble: 0,
    kodiSync: 1,
    checkIn: 2,
    checkInSeason: 3,
    plexScrobble: 4
  },
  RootQuery: new Proxy(RootQuery, resolverHandler),
  RootMutation: new Proxy(RootMutation, resolverHandler),
  History,
  WhatToWatch,
  Following
};

interface RootQueryType {
  following: (root: void, args: {}, context: Context) => Promise<Pick<FollowingType, 'showId'>[]>;
  show: (root: void, args: { id: ShowId }, context: Context) => Promise<Dragonstone.Show | null>;
  upcomingEpisode: (
    root: void,
    args: { showIds: ShowId[] },
    context: Context
  ) => Promise<Dragonstone.UpcomingEpisode[]>;
  nextEpisodeToWatch: (root: void, args: { showId: ShowId }, context: Context) => Promise<Dragonstone.Episode | null>;
  season: (root: void, args: { showId: ShowId; season: number }, context: Context) => Promise<Dragonstone.Episode[]>;
  watchedEpisodes: (
    root: void,
    args: { showId: ShowId },
    context: Context
  ) => Promise<Dragonstone.WatchedEpisode.WatchedEpisode[]>;
  whatToWatchForShow: (
    root: void,
    args: { showId: ShowId },
    context: Context
  ) => Promise<Omit<Dragonstone.ShowToWatch, 'show'>>;
  whatToWatch: (root: void, args: void, context: Context) => Promise<Omit<Dragonstone.ShowToWatch, 'show'>[]>;
  titles: (root: void, args: {}, context: Context) => Promise<Dragonstone.Title[]>;
  history: (
    root: void,
    args: { page: number },
    context: Context
  ) => Promise<Omit<Dragonstone.History, 'show' | 'episode'>[]>;
  me: (root: void, args: {}, context: Context) => Promise<Dragonstone.User>;

  [key: string]: (r: any, a: any, c: Context) => Promise<any>;
}

interface HistoryQueryType {
  show: (
    root: Omit<Dragonstone.History, 'show' | 'episode'>,
    args: {},
    context: Context
  ) => Promise<Dragonstone.Show | null>;
  episode: (
    root: Omit<Dragonstone.History, 'show' | 'episode'>,
    args: {},
    context: Context
  ) => Promise<Dragonstone.Episode | null>;

  [key: string]: (r: any, a: any, c: Context) => Promise<any>;
}

interface WhatToWatch {
  show: (root: Omit<Dragonstone.ShowToWatch, 'show'>, args: {}, context: Context) => Promise<Dragonstone.Show | null>;

  [key: string]: (r: any, a: any, c: Context) => Promise<any>;
}

interface FollowingQueryType {
  show: (root: Pick<FollowingType, 'showId'>, args: {}, context: Context) => Promise<Dragonstone.Show | null>;
  upcomingEpisode: (root: Pick<FollowingType, 'showId'>, args: {}, context: Context) => Promise<Dragonstone.Episode>;
  nextToWatch: (root: Pick<FollowingType, 'showId'>, args: {}, context: Context) => Promise<NextToWatch>;

  [key: string]: (r: any, a: any, c: Context) => Promise<any>;
}

interface RootMutationType {
  checkInEpisode: (
    root: void,
    args: { episode: Dragonstone.WatchedEpisode.WatchedEpisodeInput },
    context: Context
  ) => Promise<Dragonstone.WatchedEpisode.WatchedEpisode | null>;
  checkInEpisodes: (
    root: void,
    args: { episodes: Dragonstone.WatchedEpisode.WatchedEpisodeInput[] },
    context: Context
  ) => Promise<Dragonstone.WatchedEpisode.WatchedEpisode[]>;
  removeCheckedInEpisode: (
    root: void,
    args: { episode: Dragonstone.WatchedEpisode.UnwatchedEpisodeInput },
    context: Context
  ) => Promise<boolean>;
  followShow: (root: void, args: { showId: ShowId }, context: Context) => Promise<boolean>;
  unfollowShow: (root: void, args: { showId: ShowId }, context: Context) => Promise<boolean>;

  [key: string]: (r: any, a: any, c: Context) => Promise<any>;
}
