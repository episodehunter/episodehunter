import * as AWS from 'aws-sdk'
import { Dragonstone } from '@episodehunter/types'
import { Message } from '@episodehunter/types'
import { gql } from '@episodehunter/utils'
import { Logger } from '@episodehunter/logger'
import { config } from './config'
import { UnableToAddShowError } from './custom-error'
import { GraphQLClient } from 'graphql-request'
import {
  GetShowQuery,
  GetShowQueryVariables,
  CheckInEpisodeMutation,
  CheckInEpisodeMutationVariables
} from './dragonstone'

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
      FunctionName: config.addShowFunctionName,
      Payload: JSON.stringify(event)
    })
    .promise()
    .then(snsResult => {
      if (snsResult.FunctionError) {
        let error = snsResult.Payload && snsResult.Payload.toString()
        if (!error && snsResult.LogResult) {
          const buff = new Buffer(snsResult.LogResult, 'base64')
          error = buff.toString()
        } else if (!error) {
          error = snsResult.FunctionError
        } else {
          error = 'unknown error'
        }
        throw new UnableToAddShowError(error)
      }
      if (!snsResult.Payload) {
        throw new TypeError(`Payload is empty: ${snsResult.LogResult}`)
      }
      const result: Message.UpdateShow.AddShow.Response = JSON.parse(
        snsResult.Payload.toString()
      )
      if (!result.id) {
        throw new UnableToAddShowError(
          `Did not receive any id for the new show. theTvDbId: ${theTvDbId}`
        )
      }
      return result.id
    })
}

const getShowQuery = gql`
  query GetShow($theTvDbId: Int!) {
    findShow(theTvDbId: $theTvDbId) {
      ids {
        id
      }
    }
  }
`

export async function getShowId(
  theTvDbId: number,
  requestId: string,
  log: Logger
): Promise<number> {
  const variables: GetShowQueryVariables = { theTvDbId }
  const result = await client.request<GetShowQuery>(getShowQuery, variables)
  if (!result || !result.findShow) {
    log.log(`Request to add show with theTvDbId: ${theTvDbId}`)
    return createShow(theTvDbId, requestId)
  } else {
    return result.findShow.ids.id
  }
}

const scrobbleEpisodeQuery = gql`
  mutation checkInEpisode(
    $episode: WatchedEpisodeInput!
    $apiKey: String!
    $username: String!
  ) {
    checkInEpisode(episode: $episode, apiKey: $apiKey, username: $username) {
      madeMutation
    }
  }
`

export async function scrobbleEpisode(
  episode: Dragonstone.WatchedEpisodeInput,
  apiKey: string,
  username: string,
  requestId: string
): Promise<null> {
  client.setHeader('request-id', requestId)
  const variables: CheckInEpisodeMutationVariables = {
    episode,
    apiKey,
    username
  }
  await client.request<CheckInEpisodeMutation>(scrobbleEpisodeQuery, variables)
  return null
}
