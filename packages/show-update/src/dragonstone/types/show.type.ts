import { EpisodeInput } from './episode.type';

export type ShowInput = {
  tvdbId: number;
  imdbId?: string;
  name: string;
  airsDayOfWeek?: number;
  airsTime?: string;
  firstAired?: string;
  genre: string[];
  language?: string;
  network?: string;
  overview?: string;
  runtime: number;
  ended: boolean;
  lastupdate: number;
  episodes: EpisodeInput[];
};

export type Show = {
  ids: {
    id: string;
    tvdb: number;
  };
  name: string;
};
