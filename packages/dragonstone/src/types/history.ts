import { gql } from 'apollo-server-lambda';

export const history = gql`
  type History {
    watchedEpisode: WatchedEpisode!
    show: Show
    episode: Episode
  }
`;
