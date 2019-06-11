import { Message, ShowId } from '@episodehunter/types';

const knownShowProps: { [key in keyof Message.Dragonstone.ShowInput]: string[] } = {
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
  lastupdate: ['number']
};

const knownEpisodeProps: { [key in keyof Message.Dragonstone.UpdateEpisodes.EpisodeInput]: string[] } = {
  name: ['string'],
  episodenumber: ['number'],
  firstAired: ['string'],
  overview: ['string', 'undefined'],
  lastupdated: ['number']
};

export function assertShowInput(input: Message.Dragonstone.ShowInput) {
  const knownKeys = Object.keys(knownShowProps);
  Object.keys(input).forEach(key => {
    if (!knownKeys.includes(key)) {
      throw new TypeError(`${key} is not a valid key for a show`);
    }
  });
  Object.entries(knownShowProps).forEach(([key, values]) => {
    const validType = values!.some(type => {
      if (type === 'undefined') {
        return input[key as keyof Message.Dragonstone.ShowInput] == null; // accept null or undefined
      }
      return typeof input[key as keyof Message.Dragonstone.ShowInput] === type;
    });
    if (!validType) {
      throw new TypeError(
        `Expected type ${values!.join(' or ')} for ${key} but got ${printType(input[key as keyof Message.Dragonstone.ShowInput])} for show`
      );
    }
  });
  const validGenre = input.genre.every(g => typeof g === 'string');
  if (!validGenre) {
    throw new TypeError(`Genre is not a array of string: ${JSON.stringify(input.genre)}`);
  }
}

export function assertEpisodes(input: Message.Dragonstone.UpdateEpisodes.EpisodeInput[]) {
  input.forEach(e => assertEpisode(e));
}

function assertEpisode(input: Message.Dragonstone.UpdateEpisodes.EpisodeInput) {
  const knownKeys = Object.keys(knownEpisodeProps);
  Object.keys(input).forEach(key => {
    if (!knownKeys.includes(key)) {
      throw new TypeError(`${key} is not a valid key for a episode`);
    }
  });
  Object.entries(knownEpisodeProps).forEach(([key, values]) => {
    const validType = values!.some(type => {
      if (type === 'undefined') {
        return input[key as keyof Message.Dragonstone.UpdateEpisodes.EpisodeInput] == null; // accept null or undefined
      }
      return typeof input[key as keyof Message.Dragonstone.UpdateEpisodes.EpisodeInput] === type;
    });
    if (!validType) {
      throw new TypeError(
        `Expected type ${values!.join(' or ')} for ${key} but got ${printType(input[key as keyof Message.Dragonstone.UpdateEpisodes.EpisodeInput])} for episode ${input.episodenumber}`
      );
    }
  });
}

export function assertShowId(showId: ShowId) {
  if (typeof showId !== 'number') {
    throw new Error(`Expected showId to be of type number but got ${printType(showId)}`);
  }
}

export function assertEpisodeNumber(episodeNumber: number) {
  if (typeof episodeNumber !== 'number') {
    throw new Error(`Expected episodeNumber to be of type number but got ${printType(episodeNumber)}`);
  } else if (episodeNumber < 10_000 || episodeNumber > 1_000_000) {
    throw new Error(`Expected episodeNumber ]10000, 1000000[, but got ${episodeNumber}`);
  }
}

function printType(obj: any): string {
  if (obj === null) {
    return 'null'
  }
  return typeof obj;
}
