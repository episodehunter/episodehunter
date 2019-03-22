import { TheTvDbShow, TheTvDbShowEpisode } from '@episodehunter/thetvdb';
import { InsufficientShowInformation } from './custom-erros';

export function assertShow(show: TheTvDbShow) {
  if (Boolean(show.seriesName && show.id && show.lastUpdated)) {
    return show;
  }
  throw new InsufficientShowInformation('Insufficient information about show ' + show.id);
}

export function safeMap<T, R>(fu: (a: T) => R): (arr: T[]) => R[] {
  return (arr: T[]) => (Array.isArray(arr) ? arr.map(fu) : []);
}

export function safeFilter<T>(fu: (a: T) => boolean): (arr: T[]) => T[] {
  return (arr: T[]) => (Array.isArray(arr) ? arr.filter(fu) : []);
}

export function isValidEpisode(episode: TheTvDbShowEpisode): boolean {
  return Boolean(episode.id && episode.airedEpisodeNumber && episode.airedSeason && episode.lastUpdated && episode.firstAired);
}
