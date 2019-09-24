export interface ShowInput {
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
}
