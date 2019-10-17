> Helper lib for The movie db api

## Install

```
$ npm install @episodehunter/tmdb
```

## Usage

```js
const tmdb = new Tmdb(apikey)
```

## API

#### `constructor(apikey: string)`

Creates an instance of `Tmdb`

#### `fetchShow(id: number): Promise<Show>`

Fetch a show with given id.

## License

MIT
