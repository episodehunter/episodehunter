import fetch, { Response } from 'node-fetch'
import { NotFound, Timeout } from './custom-erros'
import AbortController from 'abort-controller'
import { TmdbShow } from './types/tmdb-show'

export class Tmdb {
  private apikey: string
  private fetch: typeof fetch

  constructor(apikey: string, _fetch = fetch) {
    this.apikey = apikey
    this.fetch = _fetch
  }

  fetchShow(id: number, log = noop): Promise<TmdbShow> {
    return this.get(
      `/tv/${id}?append_to_response=external_ids&language=en-US&api_key=${this.apikey}`,
      log
    )
      .then(handelHttpError(id))
      .then(res => res.json())
      .then(logWrapper(log, `[tmdb] Done, getting back`))
  }

  getTheTvDbId(showId: number, log = noop): Promise<number | null> {
    return this.fetchShow(showId)
      .then(show => show.external_ids.tvdb_id)
      .catch(error => {
        if (error instanceof NotFound) {
          return null
        }
        return Promise.reject(error)
      })
      .then(logWrapper(log, `[tmdb] Done, getting back`))
  }

  private async get(
    url: string,
    log: typeof noop,
    timeout = 1000
  ): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    const fullUrl = `https://api.themoviedb.org/3${url}`
    log('[tmdb] Making tmdb request to ' + fullUrl)

    try {
      const result = await this.fetch(fullUrl, {
        method: 'GET',
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      log(`[tmdb] We got a result from ${fullUrl}`)
      return result
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        log(
          `[tmdb] Did not recive any reposne within ${timeout} ms. url: ${url}`
        )
        if (timeout >= 3000) {
          log(`[tmdb] Giving up. url: ${url}`)
          throw new Timeout(
            `[tmdb] Timeout after ${timeout} ms for url: ${url}`
          )
        }
        return this.get(url, log, timeout + 1000)
      }
      if (error) {
        log(
          `[tmdb] Could not get any respone. ${error.name} ${error.message}. url: ` +
            url
        )
      } else {
        log(`[tmdb] Could not get any respone. url: ${url}`)
      }
      throw error
    }
  }
}

export const handelHttpError = (id: number) => (res: Response) => {
  if (res.status === 404) {
    throw new NotFound(`[tmdb] ${id}`)
  }
  if (!res.ok) {
    throw new Error(
      `[tmdb] Unable to get response from tmdb(${id}): ${res.statusText}`
    )
  }
  return res
}

const logWrapper = (log: (msg: string) => void, msg: string) => <T>(
  val: T
): T => {
  log(msg)
  return val
}

const noop: (msg: string) => void = () => undefined
