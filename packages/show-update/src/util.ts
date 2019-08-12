import { TheTvDbShowEpisode } from '@episodehunter/thetvdb';

export function createPromiseBatch() {
  const promises: Promise<any>[] = [];
  return {
    add(p: Promise<any>) {
      promises.push(p);
    },
    compleat<T extends any[]>(): Promise<T> {
      return Promise.all(promises) as any;
    }
  };
}

export function isValidEpisode(episode: TheTvDbShowEpisode): boolean {
  return Boolean(episode.id && episode.airedEpisodeNumber && episode.airedSeason && episode.lastUpdated && episode.firstAired);
}

export function sortEpisode(episodes: { episodenumber: number }[]) {
  return episodes.sort((a, b) => a.episodenumber - b.episodenumber);
}
