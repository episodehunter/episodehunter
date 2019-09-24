import { ShowId } from '../../types';

export interface UpdateEpisodesEvent {
  showId: ShowId;
  firstEpisode: number; // episodenumber
  lastEpisode: number; // episodenumber
  episodes: EpisodeInput[];
  requestStack: string[];
}

export type UpdateEpisodesResponse = Boolean;

export interface EpisodeInput {
  name: string;
  tvdbId: number;
  episodenumber: number;
  firstAired: string;
  overview?: string;
  lastupdated: number;
}
