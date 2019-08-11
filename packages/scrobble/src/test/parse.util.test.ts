import { isKodiEpisode, parseJson } from '../parse.util'

test('Is a kodi episode', () => {
  // Arrange
  const event = {
    media_type: 'episode'
  }

  // Act
  const result = isKodiEpisode(event as any)

  // Assert
  expect(result).toBe(true)
})

test('Is not a kodi episode', () => {
  // Arrange
  const event = {
    media_type: 'movie'
  }

  // Act
  const result = isKodiEpisode(event as any)

  // Assert
  expect(result).toBe(false)
})

test('Is a kodi scrobble episode (bug in EHX)', () => {
  // Arrange
  const event = {
    apikey: 'some-key',
    duration: 49.91793619791667,
    episode: 1,
    event_type: 'scrobble',
    media_type: 'movie',
    percent: 100,
    season: 6,
    timestamp: 1531058461,
    title: 'Game of Thrones',
    tvdb_id: '121361',
    username: 'some-username',
    year: 2011
  }

  // Act
  const result = isKodiEpisode(event as any)

  // Assert
  expect(result).toBe(true)
})

test('Is not a kodi scrobble episode', () => {
  // Arrange
  const event = {
    apikey: 'some-key',
    duration: 49.91793619791667,
    event_type: 'play',
    media_type: 'movie',
    original_title: 'The Dark Knight',
    percent: 0,
    themoviedb_id: 'tt0468569',
    timestamp: 1531060039,
    username: 'some-username',
    year: 2008
  }

  // Act
  const result = isKodiEpisode(event as any)

  // Assert
  expect(result).toBe(false)
})

test('Is not an kodi episode when media type is missing', () => {
  // Arrange
  const event = {}

  // Act
  const result = isKodiEpisode(event as any)

  // Assert
  expect(result).toBe(false)
})

test('Parse json', () => {
  // Arrange
  const jsonStr = '{ "key": "value" }'

  // Act
  const result = parseJson(jsonStr)

  // Assert
  expect(result).toEqual({ key: 'value' })
})

test('Return null when unable to parse json', () => {
  // Arrange
  const badJsonStr = '{ key: "value" }'

  // Act
  const result = parseJson(badJsonStr)

  // Assert
  expect(result).toBe(null)
})
