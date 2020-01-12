import { spy } from 'simple-spy'
import * as url from 'url'
import { NotFound } from '../custom-erros'
import {
  ensureArray,
  getHigestRating,
  handelHttpError,
  TheTvDb
} from '../the-tv-db'
import { TheTvDbShowImage } from '../types'

describe('handelHttpError', () => {
  test('reject when not okay', () => {
    // Arrange
    const res = {
      ok: false
    }

    // Act
    expect(() => handelHttpError(res as any)).toThrow()
  })

  test('Return response when ok', () => {
    // Arrange
    const res = {
      ok: true
    }

    // Act
    const result = handelHttpError(res as any)

    // Assert
    expect(result).toBe(res)
  })
})

describe('Token', () => {
  test('Get the tv db token', async () => {
    // Arrange
    const token = 'token'
    const res = {
      ok: true,
      json: () => Promise.resolve({ token })
    }
    const fetch = () => Promise.resolve(res)
    const theTvDb = new TheTvDb('apikey', { fetch: fetch as any })

    // Act
    const result = await theTvDb.token

    // Assert
    expect(result).toBe(token)
  })

  test('Use existing token', async () => {
    // Arrange
    const token = 'new token'
    const res = {
      ok: true,
      json: () => Promise.resolve({ token })
    }
    const fetch = () => Promise.resolve(res)
    const theTvDb = new TheTvDb('apikey', { fetch: fetch as any })
    theTvDb.jwt = Promise.resolve('old token')

    // Act
    const result = await theTvDb.token

    // Assert
    expect(result).toBe('old token')
  })
})

test('Get show info from the tv db', async () => {
  // Arrange
  const show = { id: 1 }
  const res = {
    ok: true,
    json: () => Promise.resolve({ data: show })
  }
  const fetch = () => Promise.resolve(res)
  const theTvDb = new TheTvDb('apikey', { fetch: fetch as any })
  theTvDb.jwt = Promise.resolve('token')

  // Act
  const result = await theTvDb.fetchShow(1)

  // Assert
  expect(result).toBe(show)
})

test('Get updated show list', async () => {
  // Arrange
  const show = { id: 1 }
  const res = {
    ok: true,
    json: () => Promise.resolve({ data: [show] })
  }
  const fetch = () => Promise.resolve(res)
  const theTvDb = new TheTvDb('apikey', { fetch: fetch as any })
  theTvDb.jwt = Promise.resolve('token')

  // Act
  const result = await theTvDb.fetchLastUpdateShowsList(11111111111)

  // Assert
  expect(result).toEqual([show])
})

test('Return a not found error', () => {
  // Arrange
  const res = {
    ok: false,
    status: 404
  }
  const fetch = () => Promise.resolve(res)
  const theTvDb = new TheTvDb('apikey', { fetch: fetch as any })
  theTvDb.jwt = Promise.resolve('token')

  // Act and Assert
  return expect(theTvDb.fetchLastUpdateShowsList(1)).rejects.toHaveProperty(
    'name',
    'NotFound'
  )
})

describe('getTvDbShowEpisodes', () => {
  test('Get one page of episodes', async () => {
    // Arrange
    const episodes = [
      {
        id: 1
      }
    ]
    const data = {
      data: episodes,
      links: {
        next: null as null | number
      }
    }
    const res = {
      ok: true,
      json: () => Promise.resolve(data)
    }
    const fetch = () => Promise.resolve(res)
    const theTvDb = new TheTvDb('apikey', { fetch: fetch as any })
    theTvDb.jwt = Promise.resolve('token')

    // Act
    const result = await theTvDb.fetchShowEpisodes(1)

    // Assert
    expect(result).toEqual(episodes)
  })

  test('Return an empty array for 404', async () => {
    // Arrange
    const res = {
      ok: false,
      status: 404
    }
    const fetch = () => Promise.resolve(res)
    const theTvDb = new TheTvDb('apikey', { fetch: fetch as any })
    theTvDb.jwt = Promise.resolve('token')

    // Act
    const result = await theTvDb.fetchShowEpisodes(1)

    // Assert
    expect(result).toEqual([])
  })

  test('Return an empty array if data is not defind', async () => {
    // Arrange
    const res = {
      ok: true,
      json: () => Promise.resolve({})
    }
    const fetch = () => Promise.resolve(res)
    const theTvDb = new TheTvDb('apikey', { fetch: fetch as any })
    theTvDb.jwt = Promise.resolve('token')

    // Act
    const result = await theTvDb.fetchShowEpisodes(1)

    // Assert
    expect(result).toEqual([])
  })

  test('Follow next', async () => {
    // Arrange
    const pages = [
      {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 1 }],
            links: {
              next: 2
            }
          })
      },
      {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 2 }],
            links: {
              next: null
            }
          })
      }
    ]

    const fetch = spy((path: string) => {
      const u = url.parse(path, true)
      return Promise.resolve(pages[Number(u.query.page) - 1])
    })
    const theTvDb = new TheTvDb('apikey', { fetch: fetch as any })
    theTvDb.jwt = Promise.resolve('token')

    // Act
    await theTvDb.fetchShowEpisodes(1)

    // Assert
    expect(fetch.callCount).toBe(2)
  })

  test('Append all episodes for all pages', async () => {
    // Arrange
    const pages = [
      {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 1 }],
            links: {
              next: 2
            }
          })
      },
      {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 2 }],
            links: {
              next: null
            }
          })
      }
    ]

    const fetch = spy((path: string) => {
      const u = url.parse(path, true)
      return Promise.resolve(pages[Number(u.query.page) - 1])
    })
    const theTvDb = new TheTvDb('apikey', { fetch: fetch as any })
    theTvDb.jwt = Promise.resolve('token')

    // Act
    const result = await theTvDb.fetchShowEpisodes(1)

    // Assert
    expect(result.length).toBe(2)
    expect(result).toEqual([
      {
        id: 1
      },
      {
        id: 2
      }
    ])
  })
})

describe('Fetch latest episodes', () => {
  test('Get the first page if there is only one page', async () => {
    // Arrange
    const pages = [
      {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 1 }],
            links: {
              fisrt: 1,
              last: 1,
              prev: null,
              next: null
            }
          })
      }
    ]

    const fetch = spy((path: string) => {
      const u = url.parse(path, true)
      return Promise.resolve(pages[Number(u.query.page) - 1])
    })
    const theTvDb = new TheTvDb('apikey', { fetch: fetch as any })
    theTvDb.jwt = Promise.resolve('token')

    // Act
    const result = await theTvDb.fetchLatestShowEpisodes(1, 5)

    // Assert
    expect(result).toEqual([
      {
        id: 1
      }
    ])
  })

  test('Get the two latest pages if there is only two pages', async () => {
    // Arrange
    const pages = [
      {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 1 }, { id: 2 }],
            links: {
              fisrt: 1,
              last: 2,
              prev: null,
              next: 2
            }
          })
      },
      {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 3 }],
            links: {
              fisrt: 1,
              last: 2,
              prev: 1,
              next: null
            }
          })
      }
    ]

    const fetch = spy((path: string) => {
      const u = url.parse(path, true)
      return Promise.resolve(pages[Number(u.query.page) - 1])
    })
    const theTvDb = new TheTvDb('apikey', { fetch: fetch as any })
    theTvDb.jwt = Promise.resolve('token')

    // Act
    const result = await theTvDb.fetchLatestShowEpisodes(1, 5)

    // Assert
    expect(result).toEqual([
      {
        id: 1
      },
      {
        id: 2
      },
      {
        id: 3
      }
    ])
  })

  test('Get the latest pages', async () => {
    // Arrange
    const pages = [
      {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 1 }, { id: 2 }],
            links: {
              fisrt: 1,
              last: 4,
              prev: null,
              next: 2
            }
          })
      },
      {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 3 }],
            links: {
              fisrt: 1,
              last: 4,
              prev: 1,
              next: 3
            }
          })
      },
      {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }],
            links: {
              fisrt: 1,
              last: 4,
              prev: 2,
              next: 4
            }
          })
      },
      {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 9 }, { id: 10 }, { id: 11 }, { id: 12 }],
            links: {
              fisrt: 1,
              last: 4,
              prev: 3,
              next: null
            }
          })
      }
    ]

    const fetch = spy((path: string) => {
      const u = url.parse(path, true)
      return Promise.resolve(pages[Number(u.query.page) - 1])
    })
    const theTvDb = new TheTvDb('apikey', { fetch: fetch as any })
    theTvDb.jwt = Promise.resolve('token')

    // Act
    const result = await theTvDb.fetchLatestShowEpisodes(1, 5)

    // Assert
    expect(result).toEqual([
      { id: 4 },
      { id: 5 },
      { id: 6 },
      { id: 7 },
      { id: 8 },
      { id: 9 },
      { id: 10 },
      { id: 11 },
      { id: 12 }
    ])
  })
})

describe('Get Higest Rating', () => {
  test('Get higest rating image', () => {
    // Arrange
    const episodes = [
      { ratingsInfo: { average: 2 } },
      { ratingsInfo: { average: 9 } },
      { ratingsInfo: { average: 5 } }
    ]

    // Act
    const result = getHigestRating(episodes as any)

    // Assert
    expect(result.ratingsInfo.average).toBe(9)
  })

  test('Get noting if the array is empty', () => {
    // Arrange
    const episodes: TheTvDbShowImage[] = []

    // Act
    const result = getHigestRating(episodes)

    // Assert
    expect(result).toBe(undefined)
  })
})

describe('Episode image', () => {
  test('Fetch image', async () => {
    // Arrange
    const apikey = 'apikey'
    const episodeId = 123
    const res = [
      {
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              filename: 'some-image.jpg'
            }
          })
      },
      {
        ok: true,
        buffer: () => Promise.resolve('buffer')
      }
    ]
    const fetch = spy((url: string) => {
      if (url === 'https://api.thetvdb.com/episodes/123') {
        return Promise.resolve(res[0])
      } else if (url === 'https://www.thetvdb.com/banners/some-image.jpg') {
        return Promise.resolve(res[1])
      }
    })
    const theTvDb = new TheTvDb(apikey, { fetch: fetch as any })
    theTvDb.jwt = Promise.resolve('token')

    // Act
    const result = await theTvDb.fetchEpisodeImage(episodeId)

    // Assert
    expect(result).toBe('buffer')
    expect(fetch.callCount).toBe(2)
  })

  test('Throw an 404 if there is no image', async () => {
    // Arrange
    const apikey = 'apikey'
    const episodeId = 123
    const res = [
      {
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              filename: ''
            }
          })
      }
    ]
    const fetch = spy((url: string) => {
      if (url === 'https://api.thetvdb.com/episodes/123') {
        return Promise.resolve(res[0])
      }
    })
    const theTvDb = new TheTvDb(apikey, { fetch: fetch as any })
    theTvDb.jwt = Promise.resolve('token')

    // Act and Assert
    return expect(theTvDb.fetchEpisodeImage(episodeId)).rejects.toBeInstanceOf(
      NotFound
    )
  })
})

describe('Show poster', () => {
  test('Fetch poster', async () => {
    // Arrange
    const apikey = 'apikey'
    const showId = 123
    const res = [
      {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              {
                fileName: 'posters/121361-1.jpg',
                ratingsInfo: {
                  average: 5.5,
                  count: 29
                }
              },
              {
                fileName: 'posters/121361-2.jpg',
                ratingsInfo: {
                  average: 6,
                  count: 1
                }
              }
            ]
          })
      },
      {
        ok: true,
        buffer: () => Promise.resolve('buffer')
      }
    ]
    const fetch = spy((url: string) => {
      if (
        url === 'https://api.thetvdb.com/series/123/images/query?keyType=poster'
      ) {
        return Promise.resolve(res[0])
      } else if (
        url === 'https://www.thetvdb.com/banners/posters/121361-2.jpg'
      ) {
        return Promise.resolve(res[1])
      }
    })
    const theTvDb = new TheTvDb(apikey, { fetch: fetch as any })
    theTvDb.jwt = Promise.resolve('token')

    // Act
    const result = await theTvDb.fetchShowPoster(showId)

    // Assert
    expect(result).toBe('buffer')
    expect(fetch.callCount).toBe(2)
  })

  test('Return a 404 when there is no poster', async () => {
    // Arrange
    const apikey = 'apikey'
    const showId = 123
    const res = [
      {
        ok: true,
        json: () =>
          Promise.resolve({
            data: []
          })
      }
    ]
    const fetch = spy((url: string) => {
      if (
        url === 'https://api.thetvdb.com/series/123/images/query?keyType=poster'
      ) {
        return Promise.resolve(res[0])
      }
    })
    const theTvDb = new TheTvDb(apikey, { fetch: fetch as any })
    theTvDb.jwt = Promise.resolve('token')

    // Act and Assert
    return expect(theTvDb.fetchShowPoster(showId)).rejects.toBeInstanceOf(
      NotFound
    )
  })
})

describe('Show fanart', () => {
  test('Fetch fanart', async () => {
    // Arrange
    const apikey = 'apikey'
    const showId = 123
    const res = [
      {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              {
                fileName: 'fanart/original/121361-1.jpg',
                ratingsInfo: {
                  average: 5.5,
                  count: 29
                }
              },
              {
                fileName: 'fanart/original/121361-2.jpg',
                ratingsInfo: {
                  average: 6,
                  count: 1
                }
              }
            ]
          })
      },
      {
        ok: true,
        buffer: () => Promise.resolve('buffer')
      }
    ]
    const fetch = spy((url: string) => {
      if (
        url === 'https://api.thetvdb.com/series/123/images/query?keyType=fanart'
      ) {
        return Promise.resolve(res[0])
      } else if (
        url === 'https://www.thetvdb.com/banners/fanart/original/121361-2.jpg'
      ) {
        return Promise.resolve(res[1])
      }
    })
    const theTvDb = new TheTvDb(apikey, { fetch: fetch as any })
    theTvDb.jwt = Promise.resolve('token')

    // Act
    const result = await theTvDb.fetchShowFanart(showId)

    // Assert
    expect(result).toBe('buffer')
    expect(fetch.callCount).toBe(2)
  })

  test('Return a 404 when there is no fanart', async () => {
    // Arrange
    const apikey = 'apikey'
    const showId = 123
    const res = [
      {
        ok: true,
        json: () =>
          Promise.resolve({
            data: []
          })
      }
    ]
    const fetch = spy((url: string) => {
      if (
        url === 'https://api.thetvdb.com/series/123/images/query?keyType=fanart'
      ) {
        return Promise.resolve(res[0])
      }
    })
    const theTvDb = new TheTvDb(apikey, { fetch: fetch as any })
    theTvDb.jwt = Promise.resolve('token')

    // Act and Assert
    return expect(theTvDb.fetchShowFanart(showId)).rejects.toBeInstanceOf(
      NotFound
    )
  })
})

describe('ensureArray', () => {
  test('Ensure we have an array', () => {
    // Arrange
    const arr = [1, 2]

    // Act
    const result = ensureArray(arr)

    // Assert
    expect(result).toBe(arr)
  })

  test('Convert non-array object to an array', () => {
    // Arrange
    const arr = null

    // Act
    const result = ensureArray(arr as any)

    // Assert
    expect(result).toEqual([])
  })
})
