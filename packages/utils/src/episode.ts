export function calculateEpisodeNumber(season: number, episode: number) {
  return season * 10000 + episode;
}

export function extractSeasonNumber(episodenumber: number) {
  return (episodenumber / 10000) | 0;
}
