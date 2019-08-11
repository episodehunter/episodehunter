import { ShowId } from '../types';

export interface Episode {
  ids: {
    showId: ShowId;
    tvdb: number;
  };
  aired: string;
  episodenumber: number;
  lastupdated: number;
  name: string;
  overview?: string;
}
