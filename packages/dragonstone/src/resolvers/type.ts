import { ShowId } from '@episodehunter/types';
import * as Schema from '@episodehunter/types/dragonstone-resolvers-types';
import { Context } from '../context';

type Maybe<T> = Schema.Maybe<T>;

export type Resolver<TParent, TArgs, TResult> = (
  parent: TParent,
  args: TArgs,
  context: Context
) => Promise<TResult> | TResult;

export type RootShow = Omit<
  Schema.Show,
  | 'seasons'
  | 'followers'
  | 'upcomingEpisode'
  | 'justAirdEpisode'
  | 'numberOfAiredEpisodes'
  | 'nextToWatch'
  | 'isFollowing'
>;
export type RootEpisode = Omit<Schema.Episode, 'watched'>;
export type RootFollowing = Omit<Schema.Following, 'show'>;
export type RootHistory = Omit<Schema.History, 'show' | 'episode'>;

type RootResolversKeys = {
  [P in keyof Required<Schema.RootQuery>]: Resolver<void, any, any>;
};

export interface RootResolvers extends RootResolversKeys {
  show: Resolver<void, Schema.RootQueryShowArgs, Maybe<RootShow>>;
  findShow: Resolver<void, Schema.RootQueryFindShowArgs, Maybe<RootShow>>;
  season: Resolver<void, Schema.RootQuerySeasonArgs, RootEpisode[]>;
  following: Resolver<void, void, RootFollowing[]>;
  titles: Resolver<void, void, Schema.Title[]>;
  history: Resolver<void, Schema.RootQueryHistoryArgs, RootHistory[]>;
  me: Resolver<void, void, Schema.User>;
}

type ShowResolversKeys = {
  [P in keyof Omit<Schema.ShowResolvers, keyof RootShow>]: Resolver<any, any, any>;
};
type ShowResolver<T> = Resolver<RootShow, void, T>;

export interface ShowResolvers extends ShowResolversKeys {
  upcomingEpisode: ShowResolver<Maybe<RootEpisode>>;
  nextToWatch: ShowResolver<{ showId: ShowId }>; // TODO: Do we need this?
  justAirdEpisode: ShowResolver<Maybe<RootEpisode>>;
  followers: ShowResolver<number>;
  isFollowing: ShowResolver<boolean>;
  seasons: ShowResolver<number[]>;
  numberOfAiredEpisodes: ShowResolver<number>;
}

type NextToWatchResolversKeys = {
  [P in keyof Schema.NextToWatchResolvers]: Resolver<any, any, any>;
};
type NextToWatchResolver<T> = Resolver<
  Maybe<Schema.WatchedEpisodeInput | Schema.WatchedEpisodeInput[] | Schema.UnwatchedEpisodeInput | { showId: number }>,
  void,
  T
>;

export interface NextToWatchResolvers extends NextToWatchResolversKeys {
  numberOfEpisodesToWatch: NextToWatchResolver<number>;
  episode: NextToWatchResolver<Maybe<RootEpisode>>;
  madeMutation: NextToWatchResolver<boolean>;
}

type EpisodeResolverKeys = {
  [P in keyof Omit<Schema.EpisodeResolvers, keyof RootEpisode>]: Resolver<any, any, any>;
};

export interface EpisodeResolvers extends EpisodeResolverKeys {
  watched: Resolver<RootEpisode, void, Schema.WatchedEpisodeInput[]>;
}

type HistoryResolversKeys = {
  [P in keyof Omit<Schema.HistoryResolvers, keyof RootHistory>]: Resolver<any, any, any>;
};

export interface HistoryResolver extends HistoryResolversKeys {
  show: Resolver<RootHistory, void, Maybe<RootShow>>;
  episode: Resolver<RootHistory, void, Maybe<RootEpisode>>;
}

type FollowingResolversKeys = {
  [P in keyof Omit<Schema.FollowingResolvers, keyof RootFollowing>]: Resolver<any, any, any>;
};

export interface FollowingResolvers extends FollowingResolversKeys {
  show: Resolver<RootFollowing, void, Maybe<RootShow>>;
}

type MutationResolversKeys = {
  [P in keyof Required<Schema.RootMutationResolvers>]: Resolver<any, any, any>;
};

export interface RootMutationResolvers extends MutationResolversKeys {
  checkInEpisode: Resolver<void, Schema.RootMutationCheckInEpisodeArgs, Maybe<Schema.WatchedEpisodeInput>>;
  checkInEpisodes: Resolver<void, Schema.RootMutationCheckInEpisodesArgs, Maybe<Schema.WatchedEpisodeInput[]>>;
  removeCheckedInEpisode: Resolver<
    void,
    Schema.RootMutationRemoveCheckedInEpisodeArgs,
    Maybe<Schema.UnwatchedEpisodeInput>
  >;
  followShow: Resolver<void, Schema.RootMutationFollowShowArgs, boolean>;
  unfollowShow: Resolver<void, Schema.RootMutationUnfollowShowArgs, boolean>;
  createUser: Resolver<void, Schema.RootMutationCreateUserArgs, boolean>;
}
