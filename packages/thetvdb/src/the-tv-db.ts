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

export class TheTvDb {
  private apikey: string
  private userkey: string
  private fetch: typeof fetch
  jwt: Promise<string>

  constructor(apikey: string, userkey: string, _fetch = fetch) {
    this.apikey = apikey
    this.userkey = userkey
    this.fetch = _fetch
  }

  get token() {
    if (!this.jwt) {
      this.jwt = this.fetchToken()
    }
    return this.jwt
  }

  fetchShow(theTvDbId: number): Promise<TheTvDbShow> {
    return this.get('https://api.thetvdb.com/series/' + theTvDbId)
      .then(handelHttpError)
      .then(res => res.json())
      .then(res => res.data)
  }

  async fetchShowEpisodes(theTvDbId: number, page = 1): Promise<TheTvDbShowEpisode[]> {
    let episodes: TheTvDbShowEpisode[] = []
    const response: TheTvDbShowEpisodePage = await this.get(
      `https://api.thetvdb.com/series/${theTvDbId}/episodes?page=${page}`
    ).then(res => {
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

    if (response.links && response.links.last && response.links.last > 10) {
      throw new TooManyEpisodes(`Number of episodes pages: ${response.links.last}`)
    }

    if (Array.isArray(response.data)) {
      episodes = response.data
    }

    if (response.links && response.links.next) {
      episodes = episodes.concat(
        await this.fetchShowEpisodes(theTvDbId, response.links.next)
      )
    }

    return episodes
  }

  fetchLastUpdateShowsList(lastUpdate: number): Promise<TheTvDbUpdatedShowId[]> {
    return this.get('https://api.thetvdb.com/updated/query?fromTime=' + lastUpdate)
      .then(handelHttpError)
      .then(res => res.json())
      .then(res => res.data)
      .then(data => ensureArray(data))
  }

  fetchEpisodeImage(episodeId: number): Promise<Buffer> {
    return this.get('https://api.thetvdb.com/episodes/' + episodeId)
      .then(handelHttpError)
      .then(res => res.json())
      .then(res => res.data)
      .then((episode: TheTvDbEpisode) => episode.filename)
      .then(filename => this.fetchImage(filename))
  }

  fetchShowPoster(showId: number): Promise<Buffer> {
    return this.get(
      `https://api.thetvdb.com/series/${showId}/images/query?keyType=poster`
    )
      .then(handelHttpError)
      .then(res => res.json())
      .then(res => res.data)
      .then(getHigestRating)
      .then(image => image.fileName)
      .then(filename => this.fetchImage(filename))
  }

  fetchShowFanart(showId: number): Promise<Buffer> {
    return this.get(
      `https://api.thetvdb.com/series/${showId}/images/query?keyType=fanart`
    )
      .then(handelHttpError)
      .then(res => res.json())
      .then(res => res.data)
      .then(getHigestRating)
      .then(image => image.fileName)
      .then(filename => this.fetchImage(filename))
  }

  private fetchImage(filename: string): Promise<Buffer> {
    return this.fetch('https://www.thetvdb.com/banners/' + filename)
      .then(handelHttpError)
      .then(response => response.buffer())
  }

  private get(url: string): Promise<Response> {
    return this.token.then(token =>
      this.fetch(url, {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + token }
      })
    )
  }

  private fetchToken(): Promise<string> {
    return this.fetch('https://api.thetvdb.com/login', {
      method: 'POST',
      body: JSON.stringify({
        apikey: this.apikey,
        userkey: this.userkey
      }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(handelHttpError)
      .then(res => res.json())
      .then(result => result.token)
  }
}

export function getHigestRating(images: TheTvDbShowImage[]): TheTvDbShowImage {
  return images.reduce((acc, image) => {
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

function ensureArray(data: any) {
  if (Array.isArray(data)) {
    return data
  }
  return []
}
