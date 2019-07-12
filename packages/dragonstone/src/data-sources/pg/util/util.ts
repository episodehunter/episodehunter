// TODO: Remove this?
export function extractEpisodeNumber(episodenumber: number) {
  return [(episodenumber / 10000) | 0, Number(String(episodenumber).substr(-4))];
}
