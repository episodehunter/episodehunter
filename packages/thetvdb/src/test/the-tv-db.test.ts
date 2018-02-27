import * as url from 'url'
import { spy } from 'simple-spy'
import { handelHttpError, TheTvDb, getHigestRating } from '../the-tv-db'

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
    const theTvDb = new TheTvDb('apikey', fetch as any)

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
    const theTvDb = new TheTvDb('apikey', fetch as any)
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
  const theTvDb = new TheTvDb('apikey', fetch as any)
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
  const theTvDb = new TheTvDb('apikey', fetch as any)
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
  const theTvDb = new TheTvDb('apikey', fetch as any)
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
    const theTvDb = new TheTvDb('apikey', fetch as any)
    theTvDb.jwt = Promise.resolve('token')

    // Act
    const result = await theTvDb.fetchShowEpisodes(1)

    // Assert
    expect(result).toBe(episodes)
  })

  test('Return an empty array for 404', async () => {
    // Arrange
    const res = {
      ok: false,
      status: 404
    }
    const fetch = () => Promise.resolve(res)
    const theTvDb = new TheTvDb('apikey', fetch as any)
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
    const theTvDb = new TheTvDb('apikey', fetch as any)
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
    const theTvDb = new TheTvDb('apikey', fetch as any)
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
    const theTvDb = new TheTvDb('apikey', fetch as any)
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

  test('Throw an error if there is too many episodes', () => {
    // Arrange
    const res = {
      ok: true,
      json: () =>
        Promise.resolve({
          data: [{ id: 1 }],
          links: {
            last: 11
          }
        })
    }

    const fetch = () => Promise.resolve(res)
    const theTvDb = new TheTvDb('apikey', fetch as any)
    theTvDb.jwt = Promise.resolve('token')

    // Act and Assert
    return expect(theTvDb.fetchShowEpisodes(1)).rejects.toHaveProperty(
      'message',
      'Number of episodes pages: 11'
    )
  })
})

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
