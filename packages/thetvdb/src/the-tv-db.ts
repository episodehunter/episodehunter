import fetch, { Response } from 'node-fetch'
import { NotFound, Timeout } from './custom-erros'
import AbortController from 'abort-controller'
import {
  TheTvDbShow,
  TheTvDbShowEpisode,
  TheTvDbShowEpisodePage,
  TheTvDbUpdatedShowId,
  TheTvDbEpisode,
  TheTvDbShowImage
} from './types'

const noop: (msg: string) => void = () => undefined
const logWrapper = (log: (msg: string) => void, msg: string) => <T>(
  val: T
): T => {
  log(msg)
  return val
}

interface Options {
  /**
    First timeout
  */
  timeout?: number

  /**
    Canculate next timeout if the first timeout was met.
    @example

    const defaultNextTimeout = (currentTimeout: number) => {
      if (currentTimeout > 10000) {
        return null // Throw an timeout error
      }
      return currentTimeout + 1000 // timeout for the next try
    }
  */
  nextTimeout?: (currentTimeout: number) => number | null

  /**
   * Custom fetch function
   */
  fetch?: typeof fetch
}

export class TheTvDb {
  private apikey: string
  private fetch: typeof fetch
  private options: Required<Omit<Options, 'fetch'>>
  jwt: Promise<string> | undefined = undefined

  constructor(apikey: string, options?: Options) {
    this.apikey = apikey
    this.fetch = options?.fetch || fetch
    const defaultNextTimeout = (currentTimeout: number) => {
      if (currentTimeout > 4000) {
        return null
      }
      return currentTimeout + 1000
    }
    this.options = {
      timeout: options?.timeout || 2000,
      nextTimeout: options?.nextTimeout || defaultNextTimeout
    }
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
    log = noop
  ): Promise<TheTvDbShowEpisode[]> {
    let episodes: TheTvDbShowEpisode[] = []
    let nextPageToLoad = 1;
    while (nextPageToLoad) {
      const response = await this.fetchEpisodePage(
        theTvDbId,
        nextPageToLoad,
        log
      )
      nextPageToLoad = response.links?.next;
      episodes = [ ...episodes, ...response.data ];
    }
    return episodes;
  }

  /**
   * Fetch the latest episodes.
   * Will return somewhere between 0 and numberOfEpisodes + 99 episodes
   */
  async fetchLatestShowEpisodes(
    theTvDbId: number,
    numberOfEpisodes: number,
    log = noop
  ) {
    const response = await this.fetchEpisodePage(
      theTvDbId,
      1,
      log
    )

    const lastPage = response.links?.last || 1;

    if (lastPage === 1) {
      return response.data
    } else if (lastPage === 2) {
      const result = await this.fetchEpisodePage(
        theTvDbId,
        2,
        log
      )
      return [...response.data, ...result.data]
    }

    let nextPageToLoad = lastPage;
    let episodes: TheTvDbShowEpisode[] = []
    while (episodes.length < numberOfEpisodes && nextPageToLoad) {
      const result = await this.fetchEpisodePage(
        theTvDbId,
        nextPageToLoad,
        log
      )
      episodes = [...result.data, ...episodes];
      nextPageToLoad = result.links.prev;
    }

    return episodes;
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

  private fetchEpisodePage(theTvDbId: number, page: number, log = noop): Promise<TheTvDbShowEpisodePage> {
    return this.get(
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
      .then(res => {
        return {
          data: ensureArray(res.data),
          links: res.links
        }
      })
      .then(logWrapper(log, `Done, getting back`))
  }

  private fetchImage(filename: string, log: typeof noop): Promise<Buffer> {
    log(`Making request to: 'https://www.thetvdb.com/banners/${filename}'`)
    return this.fetch('https://www.thetvdb.com/banners/' + filename)
      .then(handelHttpError)
      .then(logWrapper(log, 'Parse the response as a buffer'))
      .then(response => response.buffer())
      .then(logWrapper(log, 'Done and done'))
  }

  private async get(
    url: string,
    log: typeof noop,
    timeout = this.options.timeout
  ): Promise<Response> {
    log('Making request to ' + url)
    const token = await this.token
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const result = await this.fetch(url, {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + token },
        signal: controller.signal
      } as any) // The current type to not accept signal
      clearTimeout(timeoutId)
      log('We got a result from ' + url)
      return result
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        log(`Did not recive any reposne within ${timeout} ms. url: ` + url)
        const nextTimeout = this.options.nextTimeout(timeout)
        if (!nextTimeout) {
          log(`Giving up. url: ` + url)
          throw new Timeout(`Timeout after ${timeout} ms for url: ${url}`)
        }
        return this.get(url, log, nextTimeout)
      }
      if (error) {
        log(
          `Could not get any respone. ${error.name} ${error.message}. url: ` +
            url
        )
      } else {
        log(`Could not get any respone. url: ` + url)
      }
      throw error
    }
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

function rejectIfNot(error: Error) {
  return <T>(val: T): Promise<T> =>
    val ? Promise.resolve(val) : Promise.reject(error)
}
