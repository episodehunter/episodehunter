import * as AWS from 'aws-sdk'
import { Message, Dragonstone } from '@episodehunter/types'
import { config } from './config'
import { UnableToAddShowError } from './custom-error'
import { GraphQLClient } from 'graphql-request'
import { Logger } from '@episodehunter/logger'

AWS.config.update({
  region: 'us-east-1'
})

const lambda = new AWS.Lambda()

const client = new GraphQLClient(config.dragonstoneUrl)

async function createShow(
  theTvDbId: number,
  requestId: string
): Promise<number> {
  const event: Message.UpdateShow.AddShow.Event = {
    theTvDbId,
    requestStack: [requestId]
  }
  return lambda
    .invoke({
      FunctionName: config.addShowDragonstoneFunctionName,
      Payload: JSON.stringify(event)
    })
    .promise()
    .then(snsResult => {
      if (snsResult.FunctionError) {
        throw new UnableToAddShowError(snsResult.FunctionError)
      }
      if (!snsResult.Payload) {
        throw new TypeError(`Payload is empty: ${snsResult.LogResult}`)
      }
      const result: Message.UpdateShow.AddShow.Response = JSON.parse(
        snsResult.Payload.toString()
      )
      return result.id
    })
}

export async function getShowId(
  theTvDbId: number,
  requestId: string,
  log: Logger
): Promise<number> {
  const show = await client.request<null | { show: { ids: { id: number } } }>(`{
    show(theTvDbId: ${theTvDbId}) {
      ids {
        id
      }
    }
  }`)
  if (!show) {
    log.log(`Request to add show with theTvDbId: ${theTvDbId}`)
    return createShow(theTvDbId, requestId)
  } else {
    return show.show.ids.id
  }
}

const query = `
mutation checkInEpisode($episode: WatchedEpisodeInput!, $apiKey: String!, $username: String!) {
  checkInEpisode(episode: $episode, apiKey: $apiKey, username: $username) {
    madeMutation
  }
}
`

export function scrobbleEpisode(
  episodeInput: Dragonstone.WatchedEpisode.WatchedEpisodeInput,
  apiKey: string,
  username: string,
  requestId: string
): Promise<null> {
  client.setHeader('request-id', requestId)
  return client
    .request<{ checkInEpisode: null | { madeMutation: true } }>(query, {
      episodeInput,
      apiKey,
      username
    })
    .then(() => null)
}
