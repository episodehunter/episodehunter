# thetvdb [![Build Status](https://travis-ci.org/episodehunter/thetvdb.svg?branch=master)](https://travis-ci.org/episodehunter/thetvdb) [![codecov](https://codecov.io/gh/episodehunter/thetvdb/branch/master/graph/badge.svg)](https://codecov.io/gh/episodehunter/thetvdb)

> Helper lib for thetvdb api


## Install

```
$ npm install @episodehunter/thetvdb
```


## Usage

```js
const theTvDb = new TheTvDb(apikey, userkey)
```

## API

#### `constructor(apikey: string, userkey: string)`

Creates an instance of `TheTvDb`

#### `fetchShow(id: number): Promise<Show>`

Fetch a show with given id. See [the-tv-db-show.ts](src/types/the-tv-db-show.ts) for the return type

#### `fetchShowEpisodes(showId: number): Promise<Episode[]>`

Fetch all episodes for a given show id. See [TheTvDbShowEpisode in the-tv-db-show-episode.ts](src/types/the-tv-db-show-episode.ts) for the return type

Will throw an error if there is more than 1000 episodes.

#### `fetchLastUpdateShowsList(time: number): Promise<Episode[]>`

Return a list of shows that have been updated

##### time

Time in unix timestamp (sec)

#### `fetchEpisodeImage(episodeId: number): Promise<Buffer>`

#### `fetchShowPoster(showId: number): Promise<Buffer>`

#### `fetchShowFanart(showId: number): Promise<Buffer>`

## License

MIT
