import { kodi } from '../handler'
import { KodiEpisodeEvent } from '../types'
import { request } from '../../__mocks__/graphql-request'
import { response, invoke } from '../../__mocks__/aws-sdk'
import { captureException } from '../../__mocks__/@episodehunter/kingsguard'

Date.now = () => 1568825788312

describe('Kodi', () => {
  beforeEach(() => {
    request.mockReset()
    captureException.mockReset()
  })
  test('Scrobble a show that exist in Dragonstone', async () => {
    // Arrange
    const event: KodiEpisodeEvent = {
      username: 'my-username',
      apikey: 'my-apikey',
      duration: 60,
      percent: 98,
      timestamp: 1000000000,
      event_type: 'scrobble',
      media_type: 'episode',
      tvdb_id: 15,
      title: 'Dexter',
      year: 2016,
      season: 2,
      episode: 5
    }

    const context = {
      awsRequestId: 'some-request-id'
    }

    request.mockResolvedValueOnce({
      findShow: {
        ids: {
          id: 2
        }
      }
    })
    request.mockResolvedValueOnce({
      checkInEpisode: {
        madeMutation: true
      }
    })

    // Act
    const result = await kodi(
      { body: JSON.stringify(event) } as any,
      context as any
    )

    // Assert
    expect(result).toEqual({
      body: '{"message":"OK"}',
      headers: { 'Content-Type': 'application/json' },
      statusCode: '200'
    })
    expect(request.mock.calls[0][1]).toEqual({ theTvDbId: 15 })
    expect(request.mock.calls[1][1]).toEqual({
      episode: {
        episodenumber: 20005,
        showId: 2,
        time: 1568825788,
        type: 'kodiScrobble'
      },
      apiKey: 'my-apikey',
      username: 'my-username'
    })
  })

  test('Scrobble a show that dont exist in Dragonstone', async () => {
    // Arrange
    const event: KodiEpisodeEvent = {
      username: 'my-username',
      apikey: 'my-apikey',
      duration: 60,
      percent: 98,
      timestamp: 1000000000,
      event_type: 'scrobble',
      media_type: 'episode',
      tvdb_id: 15,
      title: 'Dexter',
      year: 2016,
      season: 2,
      episode: 5
    }

    const context = {
      awsRequestId: 'some-request-id'
    }

    request.mockResolvedValueOnce({
      findShow: null
    })
    response.mockResolvedValueOnce({
      Payload: JSON.stringify({
        id: 3
      })
    })
    request.mockResolvedValueOnce({
      checkInEpisode: {
        madeMutation: true
      }
    })

    // Act
    const result = await kodi(
      { body: JSON.stringify(event) } as any,
      context as any
    )

    // Assert
    expect(result).toEqual({
      body: '{"message":"OK"}',
      headers: { 'Content-Type': 'application/json' },
      statusCode: '200'
    })
    expect(request.mock.calls[0][1]).toEqual({ theTvDbId: 15 })
    expect(invoke.mock.calls[0][0].FunctionName).toBe('show-updater-prod-add')
    expect(JSON.parse(invoke.mock.calls[0][0].Payload)).toEqual({
      theTvDbId: 15,
      requestStack: ['some-request-id']
    })
    expect(request.mock.calls[1][1]).toEqual({
      episode: {
        episodenumber: 20005,
        showId: 3,
        time: 1568825788,
        type: 'kodiScrobble'
      },
      apiKey: 'my-apikey',
      username: 'my-username'
    })
  })
  test('Scrobble a show that cant be added', async () => {
    // Arrange
    const event: KodiEpisodeEvent = {
      username: 'my-username',
      apikey: 'my-apikey',
      duration: 60,
      percent: 98,
      timestamp: 1000000000,
      event_type: 'scrobble',
      media_type: 'episode',
      tvdb_id: 15,
      title: 'Dexter',
      year: 2016,
      season: 2,
      episode: 5
    }

    const context = {
      awsRequestId: 'some-request-id'
    }

    request.mockResolvedValueOnce({
      findShow: null
    })
    response.mockResolvedValueOnce({
      Payload: undefined
    })

    // Act as assert
    await expect(
      kodi({ body: JSON.stringify(event) } as any, context as any)
    ).rejects.toThrow()
    expect(captureException).toBeCalledTimes(1)
    expect(captureException.mock.calls[0][0].message).toEqual(
      'Payload is empty: undefined'
    )
  })
  test('Scrobble a show that cant be added do to error', async () => {
    // Arrange
    const event: KodiEpisodeEvent = {
      username: 'my-username',
      apikey: 'my-apikey',
      duration: 60,
      percent: 98,
      timestamp: 1000000000,
      event_type: 'scrobble',
      media_type: 'episode',
      tvdb_id: 15,
      title: 'Dexter',
      year: 2016,
      season: 2,
      episode: 5
    }

    const context = {
      awsRequestId: 'some-request-id'
    }

    request.mockResolvedValueOnce({
      findShow: null
    })
    response.mockResolvedValueOnce({
      FunctionError: new Error('The show can not be added')
    })

    // Act
    const result = await kodi(
      { body: JSON.stringify(event) } as any,
      context as any
    )

    // Assert
    expect(result).toEqual({
      body:
        '{"message":"Could not found show. Nor could we add it. Does it realy exist? Is it a tvdb show?"}',
      headers: { 'Content-Type': 'application/json' },
      statusCode: '404'
    })
    expect(captureException).toBeCalledTimes(1)
    expect(captureException.mock.calls[0][0].message).toEqual(
      'Error: The show can not be added'
    )
  })
})
