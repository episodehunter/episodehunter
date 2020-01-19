import { Message, ShowId } from '@episodehunter/types';

const knownShowProps: { [key in keyof Required<Message.Dragonstone.ShowInput>]: [string[], number?] } = {
  tvdbId: [['number'], 2147483647],
  imdbId: [['string', 'undefined'], 10],
  name: [['string']],
  airsDayOfWeek: [['number', 'undefined'], 6],
  airsTime: [['string', 'undefined'], 10],
  firstAired: [['string', 'undefined'], 10],
  genre: [['object']],
  language: [['string', 'undefined']],
  network: [['string', 'undefined']],
  overview: [['string', 'undefined']],
  runtime: [['number'], 1000],
  ended: [['boolean']],
  lastupdate: [['number'], 2147483647],
  lastupdateCheck: [['number', 'undefined'], 2147483647],
};

const knownEpisodeProps: { [key in keyof Message.Dragonstone.EpisodeInput]: string[] } = {
  name: ['string'],
  episodenumber: ['number'],
  firstAired: ['string'],
  overview: ['string', 'undefined'],
  lastupdated: ['number'],
  tvdbId: ['number']
};

export function assertShowInput(input: Message.Dragonstone.ShowInput) {
  const knownKeys = Object.keys(knownShowProps);
  Object.keys(input).forEach(key => {
    if (!knownKeys.includes(key)) {
      throw new TypeError(`${key} is not a valid key for a show`);
    }
  });
  Object.entries(knownShowProps).forEach(([key, [expectedTypes, maxLength]]) => {
    const value = input[key as keyof Message.Dragonstone.ShowInput];
    const validType = expectedTypes.some(type => {
      if (type === 'undefined') {
        return value == null; // accept null or undefined
      }
      return typeof value === type;
    });
    if (!validType) {
      throw new TypeError(
        `Expected type ${expectedTypes.join(' or ')} for ${key} but got ${printType(
          value
        )} for show`
      );
    }
    if (typeof value === 'number' && isNaN(value)) {
      throw new TypeError(`${key} is NaN but must be a value`);
    } else if (typeof value === 'number' && maxLength && value > maxLength) {
      throw new TypeError(`${key} must be max ${maxLength} but it is ${value}`);
    } else if (typeof value === 'string' && maxLength && value.length > maxLength) {
      throw new TypeError(`${key} must have a lengt of max ${maxLength} but it is ${value.length} (${value})`);
    }
  });
  const validGenre = input.genre?.every(g => typeof g === 'string');
  if (!validGenre) {
    throw new TypeError(`Genre is not a array of string: ${JSON.stringify(input.genre)}`);
  }
}

export function assertEpisodes(input: Message.Dragonstone.EpisodeInput[]) {
  input.forEach(e => assertEpisode(e));
}

function assertEpisode(input: Message.Dragonstone.EpisodeInput) {
  const knownKeys = Object.keys(knownEpisodeProps);
  Object.keys(input).forEach(key => {
    if (!knownKeys.includes(key)) {
      throw new TypeError(`${key} is not a valid key for a episode`);
    }
  });
  Object.entries(knownEpisodeProps).forEach(([key, values]) => {
    const validType = values!.some(type => {
      if (type === 'undefined') {
        return input[key as keyof Message.Dragonstone.EpisodeInput] == null; // accept null or undefined
      }
      return typeof input[key as keyof Message.Dragonstone.EpisodeInput] === type;
    });
    if (!validType) {
      throw new TypeError(
        `Expected type ${values!.join(' or ')} for ${key} but got ${printType(
          input[key as keyof Message.Dragonstone.EpisodeInput]
        )} for episode ${input.episodenumber}`
      );
    }
  });
}

export function assertShowId(showId: ShowId) {
  if (typeof showId !== 'number' || (showId | 0) !== showId || showId < 1) {
    throw new Error(`Expected showId to be of type number but got ${printType(showId)}`);
  }
}

export function assertEpisodeNumber(episodeNumber: number) {
  if (typeof episodeNumber !== 'number') {
    throw new Error(`Expected episodeNumber to be of type number but got ${printType(episodeNumber)}`);
  } else if (episodeNumber < 10_000 + 1 || episodeNumber > 100_000_000 - 1) {
    throw new Error(`Expected episodeNumber ]10_000, 100_000_000[, but got ${episodeNumber}`);
  }
}

function printType(obj: any): string {
  if (obj === null) {
    return 'null';
  }
  return typeof obj;
}
