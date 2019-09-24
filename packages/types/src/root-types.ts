import { Show, Episode, Following, History } from './dragonstone';

export type RootShow = Omit<
  Show,
  'seasons' | 'followers' | 'upcomingEpisode' | 'justAirdEpisode' | 'numberOfAiredEpisodes' | 'nextToWatch' | 'isFollowing'
>;
export type RootEpisode = Omit<Episode, 'watched'>;
export type RootFollowing = Omit<Following, 'show'>;
export type RootHistory = Omit<History, 'show' | 'episode'>;
