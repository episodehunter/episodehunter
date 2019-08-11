import { ShowId } from '../../types';

export interface Event {
  showId: ShowId;
  firstEpisode: number; // episodenumber
  lastEpisode: number; // episodenumber
  episodes: EpisodeInput[];
  requestStack: string[];
}

export type Response = Boolean;

export interface EpisodeInput {
  name: string;
  tvdbId: number;
  episodenumber: number;
  firstAired: string;
  overview?: string;
  lastupdated: number;
}
