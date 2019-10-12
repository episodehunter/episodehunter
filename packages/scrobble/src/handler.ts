import { createGuard } from '@episodehunter/kingsguard'
import { APIGatewayEvent } from 'aws-lambda'
import { parse } from 'aws-lambda-multipart-parser'
import {
  createUnauthorizedOkResponse,
  createOkResponse,
  createBadRequestResponse,
  createNotFoundResponse
} from './response'
import { PlexEvent, KodiEpisodeEvent, KodiMovieEvent } from './types'
import { plexEpisodeParse, parseJson, isKodiEpisode } from './parse.util'
import { UnableToAddShowError } from './custom-error'
import { scrobbleEpisode } from './scrobbler.util'
import { config } from './config'

const guard = createGuard(config.sentryDsn, config.logdnaKey)

export const plex = guard<APIGatewayEvent>(async (event, logger, context) => {
  const username =
    event.queryStringParameters && event.queryStringParameters.username
  const apikey = event.queryStringParameters && event.queryStringParameters.key
  logger.log(JSON.stringify(event.headers))
  logger.log(JSON.stringify(event.body))
  const payload: PlexEvent = JSON.parse(parse(event, true).payload)
  const eventType = payload.event
  const mediaType = payload.Metadata.type
  const episodeInfo = plexEpisodeParse(payload.Metadata.guid)

  logger.log(`
      Going to scrobbler for plex.
      Username: ${username}
      Apikey: ${apikey}
      Event type: ${eventType}
      Media type: ${mediaType}
      Provider: ${episodeInfo && episodeInfo.provider}
      id: ${episodeInfo && episodeInfo.id}
      season: ${episodeInfo && episodeInfo.season}
      episode: ${episodeInfo && episodeInfo.episode}
    `)

  if (eventType !== 'media.scrobble') {
    const message = `Do not support event type ${eventType} yet. Exit`
    logger.log(message)
    return createOkResponse(message)
  }

  if (mediaType !== 'episode') {
    const message = `Do not support media type ${mediaType} yet. Exit`
    logger.log(message)
    return createOkResponse(message)
  }

  if (!episodeInfo) {
    logger.log('Not valid episode info: ' + payload.Metadata.guid)
    logger.captureException(
      new Error('Not valid episode info: ' + payload.Metadata.guid)
    )
    return createOkResponse('Was not able to parse episode information')
  }

  if (!episodeInfo.episode || !episodeInfo.season) {
    const message = `Sorry, episodehunter do not accept special episodes at the moment`
    logger.log(message)
    return createOkResponse(message)
  }

  if (!username || !apikey) {
    const message = `"username" and/or apikey is missing`
    logger.log(message)
    return Promise.resolve(createUnauthorizedOkResponse(message))
  }

  return scrobbleEpisode(
    username,
    apikey,
    episodeInfo,
    logger,
    context.awsRequestId
  )
    .then(() => createOkResponse('OK'))
    .catch(error => {
      logger.log(error && error.message)
      return Promise.reject(error)
    })
})

export const kodi = guard<APIGatewayEvent>(
  async (rawEvent, logger, context) => {
    const event = parseJson<KodiEpisodeEvent | KodiMovieEvent>(rawEvent.body)
    if (!event) {
      const message = 'Unable to parse body'
      logger.log(message)
      logger.captureBreadcrumb(message, 'parse', {
        data: rawEvent.body
      })
      logger.captureException(new Error(message))
      return createBadRequestResponse(message)
    }

    if (!isKodiEpisode(event)) {
      const message = `Do not support movies yet. Exit. ${JSON.stringify(
        event
      )}`
      logger.log(message)
      return createOkResponse(message)
    }

    if (event.event_type !== 'scrobble') {
      const message = `Do not support event type ${
        event.event_type
      } yet. Exit. ${JSON.stringify(event)}`
      logger.log(message)
      return createOkResponse(message)
    }

    logger.log(`
      Scrobbler for kodi.
      Username: ${event.username}
      Apikey: ${event.apikey}
      id: ${event.tvdb_id}
      title: ${event.title}
      season: ${event.season}
      episode: ${event.episode}
    `)

    if (!event.tvdb_id || !event.episode || !event.season) {
      const message = `Sorry, episodehunter do not accept special episodes at the moment`
      logger.log(message)
      return createOkResponse(message)
    }

    if (!event.username || !event.apikey) {
      const message = `"username" and/or apikey is missing`
      logger.log(message)
      return Promise.resolve(createUnauthorizedOkResponse(message))
    }

    return scrobbleEpisode(
      event.username,
      event.apikey,
      {
        episode: Number(event.episode),
        season: Number(event.season),
        id: Number(event.tvdb_id),
        provider: 'thetvdb',
        sorce: 'kodi'
      },
      logger,
      context.awsRequestId
    )
      .then(() => createOkResponse('OK'))
      .catch(error => {
        if (error instanceof UnableToAddShowError) {
          logger.captureException(error)
          return Promise.resolve(createNotFoundResponse())
        } else {
          logger.log(error)
          return Promise.reject(error)
        }
      })
  }
)
