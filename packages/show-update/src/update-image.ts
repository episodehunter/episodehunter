import { ShowDefinitionType } from './types/show-definition.type';
import { EpisodeDefinitionType } from './types/episode-definition.type';

export function requestShowFanartIfMissing(show: ShowDefinitionType) {
  if (!show.fanart) {
    return Promise.resolve({
      type: 'fanart',
      action: 'add',
      tvdbId: show.tvdbId
    });
  }
  return Promise.resolve();
}

export function requestShowPosterIfMissing(show: ShowDefinitionType) {
  if (!show.poster) {
    return Promise.resolve({
      type: 'poster',
      action: 'add',
      tvdbId: show.tvdbId
    });
  }
  return Promise.resolve();
}

export function requestEpisodesImagesIfMissing(episodes: EpisodeDefinitionType[]) {
  return Promise.all(
    episodes.map(episode =>
      Promise.resolve({
        type: 'episode',
        action: 'add',
        tvdbId: episode.tvdbId
      })
    )
  );
}
