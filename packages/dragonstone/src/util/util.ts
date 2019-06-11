export function safeMap<T, R>(arr: T[] | undefined, mapper: (value: T) => R) {
  if (!arr) {
    return [];
  }
  return arr.map(mapper);
}

export function calculateEpisodeNumber(season: number, episode: number) {
  return season * 10000 + episode;
}

export function dateFormat(date = new Date()): string {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + date.getDate();
}

export function unixTimestamp() {
  return Date.now()/1000|0;
}
