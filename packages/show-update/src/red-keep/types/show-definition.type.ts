import { EpisodeDefinitionType } from './episode-definition.type';

export type ShowDefinitionType = {
  id?: number;
  tvdbId: number;
  imdbId: string;
  name: string;
  airsDayOfWeek: string;
  airsTime: string;
  firstAired: string;
  genre: string[];
  language?: string; // Deprecated
  network: string;
  overview: string;
  runtime: number;
  ended: boolean;
  fanart?: string;
  poster?: string;
  episodes?: EpisodeDefinitionType[];
  lastupdate: number;
};
