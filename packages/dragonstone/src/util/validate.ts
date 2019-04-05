import { ShowInput } from '../types/show';
import { EpisodeInput } from '../types/episode';

const knownShowProps: { [key: string]: string[] } = {
  tvdbId: ['number'],
  imdbId: ['string', 'undefined'],
  name: ['string'],
  airsDayOfWeek: ['number', 'undefined'],
  airsTime: ['string', 'undefined'],
  firstAired: ['string', 'undefined'],
  genre: ['object'],
  language: ['string', 'undefined'],
  network: ['string', 'undefined'],
  overview: ['string', 'undefined'],
  runtime: ['number'],
  ended: ['boolean'],
  lastupdate: ['number'],
  episodes: ['object']
};

const knownEpisodeProps: { [key: string]: string[] } = {
  tvdbId: ['number'],
  name: ['string'],
  season: ['number'],
  episode: ['number'],
  firstAired: ['string'],
  overview: ['string', 'undefined'],
  lastupdated: ['number']
};

export function assertShowInput(input: ShowInput) {
  const knownKeys = Object.keys(knownShowProps)
  Object.keys(input).forEach(key => {
    if (!knownKeys.includes(key)) {
      throw new TypeError(`${key} is not a valid key for a show`);
    }
  })
  Object.entries(knownShowProps).forEach(([key, values]) => {
    const validType = values.some(type => {
      return typeof input[key as keyof ShowInput] === type;
    });
    if (!validType) {
      throw new TypeError(
        `Expected type ${values.join(' or ')} for ${key} but got ${typeof input[key as keyof ShowInput]}`
      );
    }
  });
  const validGenre = input.genre.every(g => typeof g === 'string');
  if (!validGenre) {
    throw new TypeError(`Genre is not a array of string: ${JSON.stringify(input.genre)}`);
  }
  input.episodes.forEach(e => assertEpisode(e));
}

function assertEpisode(input: EpisodeInput) {
  const knownKeys = Object.keys(knownEpisodeProps)
  Object.keys(input).forEach(key => {
    if (!knownKeys.includes(key)) {
      throw new TypeError(`${key} is not a valid key for a episode`);
    }
  })
  Object.entries(knownEpisodeProps).forEach(([key, values]) => {
    const validType = values.some(type => {
      return typeof input[key as keyof EpisodeInput] === type;
    });
    if (!validType) {
      throw new TypeError(
        `Expected type ${values.join(' or ')} for ${key} but got ${typeof input[key as keyof EpisodeInput]}`
      );
    }
  });
}

export function assertShowId(showId: string) {
  if (typeof showId !== 'string') {
    throw new Error(`Expected showId to be of type string but got ${typeof showId}`)
  }
}
