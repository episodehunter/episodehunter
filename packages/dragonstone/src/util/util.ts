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
  return (Date.now() / 1000) | 0;
}

export function daysAgoOnFormatYYYYMMDD(n: number, now: Date) {
  now.setDate(now.getDate() - n);
  return createDateString(now);
}

export function createDateString(date: Date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
