import { ShowId } from '../types';

export interface Show {
  airs: {
    first: string | null;
    time: string | null;
    day: number | null;
  };
  ended: boolean;
  genre: string[];
  ids: {
    id: ShowId;
    imdb: string | null;
    tvdb: number;
  };
  language: string | null;
  lastupdated: number;
  name: string;
  network: string | null;
  overview: string | null;
  runtime: number;
}
