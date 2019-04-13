import fetch, { Response } from 'node-fetch'
import { TooManyEpisodes, NotFound } from './custom-erros'
import {
  TheTvDbShow,
  TheTvDbShowEpisode,
  TheTvDbShowEpisodePage,
  TheTvDbUpdatedShowId,
  TheTvDbEpisode,
  TheTvDbShowImage
} from './types'

const noop: (msg: string) => void = () => undefined
const logWrapper = (log, msg: string) => <T>(val: T): T => {
  log(msg)
  return val
}

export class TheTvDb {
  private apikey: string
  private fetch: typeof fetch
  jwt: Promise<string>

  constructor(apikey: string, _fetch = fetch) {
    this.apikey = apikey
    this.fetch = _fetch
  }

  get token() {
    if (!this.jwt) {
      this.jwt = this.fetchToken()
    }
    return this.jwt
  }

  fetchShow(theTvDbId: number, log = noop): Promise<TheTvDbShow> {
    return this.get('https://api.thetvdb.com/series/' + theTvDbId, log)
      .then(handelHttpError)
      .then(res => res.json())
      .then(logWrapper(log, `Done, getting back`))
      .then(res => res.data)
  }

  async fetchShowEpisodes(
    theTvDbId: number,
    page = 1,
    log = noop
  ): Promise<TheTvDbShowEpisode[]> {
    let episodes: TheTvDbShowEpisode[] = []
    const response: TheTvDbShowEpisodePage = await this.get(
      `https://api.thetvdb.com/series/${theTvDbId}/episodes?page=${page}`,
      log
    )
      .then(res => {
        // The tv db API has a bug where the next page can give a 404
        if (res.status === 404) {
          return {
            data: [],
            links: {} as any
          } as TheTvDbShowEpisodePage
        }
        handelHttpError(res)
        return res.json()
      })
      .then(logWrapper(log, `Done, getting back`))

    if (response.links && response.links.last && response.links.last > 10) {
      throw new TooManyEpisodes(
        `Number of episodes pages: ${response.links.last}`
      )
    }

    if (Array.isArray(response.data)) {
      episodes = response.data
    }

    if (response.links && response.links.next) {
      episodes = episodes.concat(
        await this.fetchShowEpisodes(theTvDbId, response.links.next, log)
      )
    }

    return episodes
  }

  fetchLastUpdateShowsList(
    lastUpdate: number,
    log = noop
  ): Promise<TheTvDbUpdatedShowId[]> {
    return this.get(
      'https://api.thetvdb.com/updated/query?fromTime=' + lastUpdate,
      log
    )
      .then(handelHttpError)
      .then(res => res.json())
      .then(res => res.data)
      .then(data => ensureArray(data))
  }

  fetchEpisodeImage(episodeId: number, log = noop): Promise<Buffer> {
    return this.get('https://api.thetvdb.com/episodes/' + episodeId, log)
      .then(handelHttpError)
      .then(res => res.json())
      .then(res => res.data)
      .then((episode: TheTvDbEpisode) => episode.filename)
      .then(rejectIfNot(new NotFound()))
      .then(filename => this.fetchImage(filename, log))
  }

  fetchShowPoster(showId: number, log = noop): Promise<Buffer> {
    return this.get(
      `https://api.thetvdb.com/series/${showId}/images/query?keyType=poster`,
      log
    )
      .then(handelHttpError)
      .then(res => res.json())
      .then(res => res.data)
      .then(getHigestRating)
      .then(rejectIfNot(new NotFound()))
      .then(image => image.fileName)
      .then(filename => this.fetchImage(filename, log))
  }

  fetchShowFanart(showId: number, log = noop): Promise<Buffer> {
    return this.get(
      `https://api.thetvdb.com/series/${showId}/images/query?keyType=fanart`,
      log
    )
      .then(handelHttpError)
      .then(res => res.json())
      .then(res => res.data)
      .then(getHigestRating)
      .then(rejectIfNot(new NotFound()))
      .then(image => image.fileName)
      .then(filename => this.fetchImage(filename, log))
  }

  private fetchImage(filename: string, log: typeof noop): Promise<Buffer> {
    log(`Making request to: 'https://www.thetvdb.com/banners/${filename}'`)
    return this.fetch('https://www.thetvdb.com/banners/' + filename)
      .then(handelHttpError)
      .then(logWrapper(log, 'Parse the response as a buffer'))
      .then(response => response.buffer())
      .then(logWrapper(log, 'Done and done'))
  }

  private get(url: string, log: typeof noop): Promise<Response> {
    log('Making request to ' + url)
    return this.token.then(token =>
      this.fetch(url, {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + token }
      }).then(logWrapper(log, 'We got a result from ' + url))
    )
  }

  private fetchToken(): Promise<string> {
    return this.fetch('https://api.thetvdb.com/login', {
      method: 'POST',
      body: JSON.stringify({
        apikey: this.apikey
      }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(handelHttpError)
      .then(res => res.json())
      .then(result => result.token)
  }
}

export function getHigestRating(images: TheTvDbShowImage[]): TheTvDbShowImage {
  return ensureArray(images).reduce((acc, image) => {
    if (image.ratingsInfo.average > acc.ratingsInfo.average) {
      return image
    } else {
      return acc
    }
  }, images[0])
}

export function handelHttpError(res: Response) {
  if (res.status === 404) {
    throw new NotFound()
  }
  if (!res.ok) {
    throw new Error('Unable to make the http request: ' + res.statusText)
  }
  return res
}

export function ensureArray<T = any>(data: T[]): T[] {
  if (Array.isArray(data)) {
    return data
  }
  return []
}

function rejectIfNot(error) {
  return val => (val ? val : Promise.reject(error))
}
