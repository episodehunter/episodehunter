import { Dragonstone, ShowId } from '@episodehunter/types';
import { ApolloError } from 'apollo-server-lambda';
import { Context } from '../context';
import { unixTimestampType } from './timestamp';
import { Following as FollowingType, NextToWatch } from './type';
import { History } from '@episodehunter/types/dragonstone';

const RootQuery: RootQueryType = {
  show(root, args, context) {
    return context.pgResolver.show.getShow(args.id);
  },
  season(root, args, context) {
    return context.pgResolver.episode.getSeasonEpisodes(args.showId, args.season);
  },
  following(root, args, context) {
    return context.pgResolver.user.getFollowing(context.getUid());
  },
  // async nextEpisodeToWatch(root, args, context) {
  //   return context.pgResolver.episode.getNextEpisodeToWatch(context.getUid(), args.showId);
  // },
  // async watchedEpisodes(root, args, context) {
  //   return context.pgResolver.history.getWatchedEpisodesForShow(context.getUid(), args.showId);
  // },
  // async whatToWatch(root, args, context) {
  //   return context.pgResolver.history.getNumberOfEpisodesToWatch(context.getUid());
  // },
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
  }
  // upcomingEpisode(root, args, context) {
  //   return context.pgResolver.upcoming.getUpcomingEpisode(root.showId);
  // }
  // nextToWatch(root, args, context) {
  //   return context.pgResolver.history.getNumberOfEpisodesToWatchForShow(context.getUid(), root.showId);
  // }
};

const Show = {
  upcomingEpisode(root: any, args: any, context: Context) {
    return context.pgResolver.upcoming.getUpcomingEpisode(root.ids.id);
  },
  nextToWatch(root: any, args: any, context: Context) {
    return {
      showId: root.ids.id
    };
  },
  justAirdEpisode(root: any, args: any, context: Context) {
    return context.pgResolver.upcoming.getJustAirdEpisode(root.ids.id);
  },
  followers(root: any, args: any, context: Context) {
    return context.pgResolver.show.getNumberOfFollowers(root.ids.id);
  },
  isFollowing(root: any, args: any, context: Context) {
    return context.pgResolver.show.isFollowingShow(root.ids.id, context.getUid());
  },
  seasons(root: any, args: any, context: Context) {
    return context.pgResolver.episode.getSeasons(root.ids.id);
  },
  numberOfAiredEpisodes(root: any, args: any, context: Context) {
    return context.pgResolver.episode.getNumberOfAiredEpisodes(root.ids.id);
  }
};

const NextToWatch = {
  numberOfEpisodesToWatch(
    root:
      | Dragonstone.WatchedEpisode.UnwatchedEpisodeInput
      | Dragonstone.WatchedEpisode.InternalWatchedEpisodeInput
      | Dragonstone.WatchedEpisode.UnwatchedEpisodeInput[]
      | { showId: number },
    args: any,
    context: Context
  ) {
    let showId = 0;
    if (Array.isArray(root)) {
      showId = root[0] && root[0].showId;
    } else if (root && root.showId) {
      showId = root.showId;
    }
    if (!showId) {
      return null;
    }
    return context.pgResolver.history.getNumberOfEpisodesToWatchForShow(context.getUid(), showId);
  },
  episode(
    root:
      | Dragonstone.WatchedEpisode.UnwatchedEpisodeInput
      | Dragonstone.WatchedEpisode.InternalWatchedEpisodeInput
      | Dragonstone.WatchedEpisode.UnwatchedEpisodeInput[]
      | { showId: number },
    args: any,
    context: Context
  ) {
    let showId = 0;
    if (Array.isArray(root)) {
      showId = root[0] && root[0].showId;
    } else if (root && root.showId) {
      showId = root.showId;
    }
    if (!showId) {
      return null;
    }
    return context.pgResolver.episode.getNextEpisodeToWatch(context.getUid(), showId);
  }
};

const Episode = {
  watched(root: any, args: any, context: Context) {
    return context.pgResolver.history.getWatchHistoryForEpisode(context.getUid(), root.ids.showId, root.episodenumber);
  }
};

const RootMutation: RootMutationType = {
  checkInEpisode(root, args, context) {
    return context.pgResolver.history.checkInEpisode(context.getUid(), args.episode);
  },
  checkInEpisodes(root, args, context) {
    return context.pgResolver.history.checkInEpisodes(context.getUid(), args.episodes);
  },
  removeCheckedInEpisode(root, args, context) {
    return context.pgResolver.history.removeCheckedInEpisode(context.getUid(), args.episode);
  },
  followShow(root, args, context) {
    return context.pgResolver.user.followShow(context.getUid(), args.showId);
  },
  unfollowShow(root, args, context) {
    return context.pgResolver.user.unfollowShow(context.getUid(), args.showId);
  }
};

// const resolverHandler = {
//   get<R, A>(target: { [key: string]: (r: R, a: A, c: Context) => Promise<any> }, prop: string) {
//     return (root: R, args: A, context: Context) => {
//       return target[prop](root, args, context).catch(error => {
//         context.logger.warn(`Reolver (${prop}) endeds with error: ${error}`);
//         context.logger.captureException(error);
//         return Promise.reject(error);
//       });
//     };
//   }
// };

export const resolvers = {
  Timestamp: unixTimestampType,
  WatchedEnum: {
    kodiScrobble: 0,
    kodiSync: 1,
    checkIn: 2,
    checkInSeason: 3,
    plexScrobble: 4
  },
  RootQuery: RootQuery, //new Proxy(RootQuery, resolverHandler),
  RootMutation: RootMutation, //new Proxy(RootMutation, resolverHandler),
  History,
  WhatToWatch,
  Following,
  Show,
  NextToWatch,
  Episode
};

interface RootQueryType {
  show: (root: void, args: { id: ShowId }, context: Context) => Promise<Dragonstone.Show | null>;
  season: (root: void, args: { showId: ShowId; season: number }, context: Context) => Promise<Dragonstone.Episode[]>;
  following: (root: void, args: {}, context: Context) => Promise<Pick<FollowingType, 'showId'>[]>;
  // nextEpisodeToWatch: (root: void, args: { showId: ShowId }, context: Context) => Promise<Dragonstone.Episode | null>;
  // watchedEpisodes: (
  //   root: void,
  //   args: { showId: ShowId },
  //   context: Context
  // ) => Promise<Dragonstone.WatchedEpisode.WatchedEpisode[]>;
  // whatToWatch: (root: void, args: void, context: Context) => Promise<Omit<Dragonstone.ShowToWatch, 'show'>[]>;
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
  // upcomingEpisode: (
  //   root: Pick<FollowingType, 'showId'>,
  //   args: {},
  //   context: Context
  // ) => Promise<Dragonstone.Episode | null>;
  // nextToWatch: (root: Pick<FollowingType, 'showId'>, args: {}, context: Context) => Promise<NextToWatch>;

  [key: string]: (r: any, a: any, c: Context) => Promise<any>;
}

interface RootMutationType {
  checkInEpisode: (
    root: void,
    args: { episode: Dragonstone.WatchedEpisode.InternalWatchedEpisodeInput },
    context: Context
  ) => Promise<Dragonstone.WatchedEpisode.InternalWatchedEpisodeInput>;
  checkInEpisodes: (
    root: void,
    args: { episodes: Dragonstone.WatchedEpisode.InternalWatchedEpisodeInput[] },
    context: Context
  ) => Promise<Dragonstone.WatchedEpisode.InternalWatchedEpisodeInput[]>;
  removeCheckedInEpisode: (
    root: void,
    args: { episode: Dragonstone.WatchedEpisode.UnwatchedEpisodeInput },
    context: Context
  ) => Promise<Dragonstone.WatchedEpisode.UnwatchedEpisodeInput>;
  followShow: (root: void, args: { showId: ShowId }, context: Context) => Promise<boolean>;
  unfollowShow: (root: void, args: { showId: ShowId }, context: Context) => Promise<boolean>;

  [key: string]: (r: any, a: any, c: Context) => Promise<any>;
}
