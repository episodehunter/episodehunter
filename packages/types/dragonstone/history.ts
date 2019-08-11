import { WatchedEpisode } from './watched-episode';
import { Show } from './show';
import { Episode } from './episode';

export interface History {
  watchedEpisode: WatchedEpisode;
  show: Show;
  episode: Episode;
}
