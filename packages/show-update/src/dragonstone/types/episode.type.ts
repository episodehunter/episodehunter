export type EpisodeInput = {
  tvdbId: number;
  name: string;
  season: number;
  episode: number;
  firstAired: string;
  overview?: string;
  lastupdated: number;
};
