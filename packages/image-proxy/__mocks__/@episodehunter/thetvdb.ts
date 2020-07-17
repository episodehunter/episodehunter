import { join } from 'path';
import { readFileSync } from 'fs';

export const files = {
  episode: readFileSync(join(__dirname, './data/episode.jpg')),
  fanart: readFileSync(join(__dirname, './data/fanart.jpg')),
  poster: readFileSync(join(__dirname, './data/poster.jpg')),
}

export const fetchEpisodeImage = jest.fn();
export const fetchShowPoster = jest.fn();
export const fetchShowFanart = jest.fn();
export class TheTvDb {
  fetchEpisodeImage = fetchEpisodeImage;
  fetchShowPoster = fetchShowPoster;
  fetchShowFanart = fetchShowFanart;
}

export class NotFound extends Error {}
