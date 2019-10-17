import { handelHttpError, Tmdb } from '../tmdb'

describe('handelHttpError', () => {
  test('Reject when not okay', () => {
    // Arrange
    const res = {
      ok: false
    }

    // Act
    expect(() => handelHttpError(1)(res as any)).toThrow()
  })

  test('Return response when ok', () => {
    // Arrange
    const res = {
      ok: true
    }

    // Act
    const result = handelHttpError(1)(res as any)

    // Assert
    expect(result).toBe(res)
  })
})

test('Get show info from the tv db', async () => {
  // Arrange
  const show = { id: 1 }
  const res = {
    ok: true,
    json: () => Promise.resolve(show)
  }
  const fetch = () => Promise.resolve(res)
  const tmdb = new Tmdb('apikey', fetch as any)

  // Act
  const result = await tmdb.fetchShow(1)

  // Assert
  expect(result).toBe(show)
})

test('Get the tv db id for a show', async () => {
  // Arrange
  const show = { id: 1, external_ids: { tvdb_id: 10 } }
  const res = {
    ok: true,
    json: () => Promise.resolve(show)
  }
  const fetch = () => Promise.resolve(res)
  const tmdb = new Tmdb('apikey', fetch as any)

  // Act
  const result = await tmdb.getTheTvDbId(1)

  // Assert
  expect(result).toBe(10)
})

test('Get null if the show dont exist', async () => {
  // Arrange
  const res = {
    ok: false,
    status: 404
  }
  const fetch = () => Promise.resolve(res)
  const tmdb = new Tmdb('apikey', fetch as any)

  // Act
  const result = await tmdb.getTheTvDbId(1)

  // Assert
  expect(result).toBe(null)
})

test('Return a not found error', () => {
  // Arrange
  const res = {
    ok: false,
    status: 404
  }
  const fetch = () => Promise.resolve(res)
  const tmdb = new Tmdb('apikey', fetch as any)

  // Act and Assert
  return expect(tmdb.fetchShow(1)).rejects.toHaveProperty('name', 'NotFound')
})
