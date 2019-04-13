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

export function createPromiseBatch() {
  const promises: Promise<any>[] = []
  return {
    add(p: Promise<any>) {
      promises.push(p)
    },
    compleat<T extends any[]>(): Promise<T> {
      return Promise.all(promises) as any;
    }
  }
}

export function isValidEpisode(episode: TheTvDbShowEpisode): boolean {
  return Boolean(episode.id && episode.airedEpisodeNumber && episode.airedSeason && episode.lastUpdated && episode.firstAired);
}

export function calculateEpisodeNumber(episode: { season: number, episode: number }): number {
  return episode.season * 10000 + episode.episode;
}

export function sortEpisode(episodes: { season: number, episode: number }[]) {
  return episodes.sort((a, b) => {
    if (a.season > b.season) {
      return 1;
    } else if (a.season < b.season) {
      return -1;
    } else if (a.episode > b.episode) {
      return 1;
    } else if (a.episode < b.episode) {
      return -1;
    }
    return 0
  });
}
