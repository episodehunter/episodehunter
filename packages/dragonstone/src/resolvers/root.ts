import { History } from '@episodehunter/types/dragonstone';
import { ApolloError } from 'apollo-server-lambda';
import { Context } from '../context';
import { unixTimestampType } from './timestamp';
import {
  EpisodeQuerryType,
  FollowingQueryType,
  HistoryQueryType,
  NextToWatchQuerryType,
  RootMutationType,
  RootQueryType,
  ShowQueryType
} from './type';

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

const Following: FollowingQueryType = {
  show(root, args, context) {
    return context.pgResolver.show.getShow(root.showId);
  }
};

const Show: ShowQueryType = {
  upcomingEpisode(root, args, context) {
    return context.pgResolver.upcoming.getUpcomingEpisode(root.ids.id);
  },
  nextToWatch(root, args, context) {
    return {
      showId: root.ids.id
    };
  },
  justAirdEpisode(root, args, context) {
    return context.pgResolver.upcoming.getJustAirdEpisode(root.ids.id);
  },
  followers(root, args, context) {
    return context.pgResolver.show.getNumberOfFollowers(root.ids.id);
  },
  isFollowing(root, args, context) {
    return context.pgResolver.show.isFollowingShow(root.ids.id, context.getUid());
  },
  seasons(root, args, context) {
    return context.pgResolver.episode.getSeasons(root.ids.id);
  },
  numberOfAiredEpisodes(root, args, context) {
    return context.pgResolver.episode.getNumberOfAiredEpisodes(root.ids.id);
  }
};

const NextToWatch: NextToWatchQuerryType = {
  numberOfEpisodesToWatch(root, args, context) {
    let showId = 0;
    if (Array.isArray(root)) {
      showId = root[0] && root[0].showId;
    } else if (root && root.showId) {
      showId = root.showId;
    }
    if (!showId) {
      return Promise.resolve(0);
    }
    return context.pgResolver.history.getNumberOfEpisodesToWatchForShow(context.getUid(), showId);
  },
  episode(root, args, context) {
    let showId = 0;
    if (Array.isArray(root)) {
      showId = root[0] && root[0].showId;
    } else if (root && root.showId) {
      showId = root.showId;
    }
    if (!showId) {
      return Promise.resolve(null);
    }
    return context.pgResolver.episode.getNextEpisodeToWatch(context.getUid(), showId);
  }
};

const Episode: EpisodeQuerryType = {
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

export const resolvers = {
  Timestamp: unixTimestampType,
  WatchedEnum: {
    kodiScrobble: 0,
    kodiSync: 1,
    checkIn: 2,
    checkInSeason: 3,
    plexScrobble: 4
  },
  RootQuery: RootQuery,
  RootMutation: RootMutation,
  History,
  Following,
  Show,
  NextToWatch,
  Episode
};
