export function safeMap<T, R>(arr: T[] | undefined, mapper: (value: T) => R) {
  if (!arr) {
    return [];
  }
  return arr.map(mapper);
}

export function calculateEpisodeNumber(season: number, episode: number) {
  return season * 10000 + episode;
}
