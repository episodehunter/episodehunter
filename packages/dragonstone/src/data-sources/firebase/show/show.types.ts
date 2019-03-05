export interface Show {
  airs: {
    first?: string,
    time?: string
  },
  ended: boolean,
  genre: string[],
  ids: {
    id: string,
    imdb?: string,
    tvdb: number
  },
  language?: string,
  lastupdated: number,
  name: string,
  network?: string,
  numberOfFollowers: number,
  overview: string,
  runtime: number,
  seasons: number[],
  totalNumberOfEpisodes: number
}
