import { Dragonstone, ShowId } from '@episodehunter/types';
import { Show } from '@episodehunter/types/dragonstone';
import { Context } from '../context';
import { Following as FollowingType } from './type';

export interface Following {
  show: Show;
  showId: ShowId;
}

interface IndexResolver {
  [key: string]: (root: any, args: any, context: Context) => any;
}

export interface ShowQueryType extends IndexResolver {
  upcomingEpisode(root: Dragonstone.Show, args: void, context: Context): Promise<Dragonstone.Episode | null>;
  nextToWatch(root: Dragonstone.Show, args: void, context: Context): { showId: ShowId };
  justAirdEpisode(root: Dragonstone.Show, args: void, context: Context): Promise<Dragonstone.Episode | null>;
  followers(root: Dragonstone.Show, args: void, context: Context): Promise<number>;
  isFollowing(root: Dragonstone.Show, args: void, context: Context): Promise<boolean>;
  seasons(root: Dragonstone.Show, args: void, context: Context): Promise<number[]>;
  numberOfAiredEpisodes(root: Dragonstone.Show, args: void, context: Context): Promise<number>;
}

export interface NextToWatchQuerryType extends IndexResolver {
  numberOfEpisodesToWatch(
    root:
      | Dragonstone.WatchedEpisode.UnwatchedEpisodeInput
      | Dragonstone.WatchedEpisode.InternalWatchedEpisodeInput
      | Dragonstone.WatchedEpisode.UnwatchedEpisodeInput[]
      | { showId: number },
    args: void,
    context: Context
  ): Promise<number>;
  episode(
    root:
      | Dragonstone.WatchedEpisode.UnwatchedEpisodeInput
      | Dragonstone.WatchedEpisode.InternalWatchedEpisodeInput
      | Dragonstone.WatchedEpisode.UnwatchedEpisodeInput[]
      | { showId: number },
    args: void,
    context: Context
  ): Promise<Dragonstone.Episode | null>;
  madeMutation(root:
    | Dragonstone.WatchedEpisode.UnwatchedEpisodeInput
    | Dragonstone.WatchedEpisode.InternalWatchedEpisodeInput
    | Dragonstone.WatchedEpisode.UnwatchedEpisodeInput[]
    | { showId: number },
  args: void,
  context: Context): boolean
}

export interface EpisodeQuerryType extends IndexResolver {
  watched(
    root: Dragonstone.Episode,
    args: void,
    context: Context
  ): Promise<Dragonstone.WatchedEpisode.WatchedEpisode[]>;
}

export interface RootQueryType extends IndexResolver {
  show: (root: void, args: { id: ShowId }, context: Context) => Promise<Dragonstone.Show | null>;
  season: (root: void, args: { showId: ShowId; season: number }, context: Context) => Promise<Dragonstone.Episode[]>;
  following: (root: void, args: {}, context: Context) => Promise<Pick<FollowingType, 'showId'>[]>;
  titles: (root: void, args: {}, context: Context) => Promise<Dragonstone.Title[]>;
  history: (
    root: void,
    args: { page: number },
    context: Context
  ) => Promise<Omit<Dragonstone.History, 'show' | 'episode'>[]>;
  me: (root: void, args: {}, context: Context) => Promise<Dragonstone.User>;
}

export interface HistoryQueryType extends IndexResolver {
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
}

export interface FollowingQueryType extends IndexResolver {
  show: (root: Pick<FollowingType, 'showId'>, args: {}, context: Context) => Promise<Dragonstone.Show | null>;
}

export interface RootMutationType extends IndexResolver {
  checkInEpisode: (
    root: void,
    args: { episode: Dragonstone.WatchedEpisode.InternalWatchedEpisodeInput, apiKey?: string, username?: string },
    context: Context
  ) => Promise<Dragonstone.WatchedEpisode.InternalWatchedEpisodeInput | null>;
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
  createUser: (root: void, args: { metadata: Dragonstone.UserInput }, context: Context) => Promise<boolean>;
}
