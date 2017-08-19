export interface TheTvDbShow {
  id: number;
  seriesName: string;
  seriesId: string;
  status: 'Continuing';
  firstAired: string; // YYYY-MM-DD
  network: string;
  runtime: string; // eg. 55
  genre: string[];
  overview: string;
  lastUpdated: number; // unix timestamp
  airsDayOfWeek: string; // eg. Sunday
  airsTime: string; // 9:00 PM
  imdbId: string;
  zap2itId: string;
}
