import { gql } from 'apollo-server-lambda';
import { WatchedEpisode } from './watched-episode';
import { Show } from './show';
import { Episode } from './episode';

export const history = gql`
  type History {
    watchedEpisode: WatchedEpisode!
    show: Show
    episode: Episode
  }
`;

export interface History {
  watchedEpisode: WatchedEpisode;
  show: Show;
  episode: Episode;
}
