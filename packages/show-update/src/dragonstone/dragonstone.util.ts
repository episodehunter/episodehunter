import * as AWS from 'aws-sdk';
import { Lambda } from 'aws-sdk';
import { config } from '../config';
import { ShowInput } from './types/show.type';
import { EpisodeInput } from './types/episode.type';

AWS.config.update({
  region: 'us-east-1'
});

const lambda = new AWS.Lambda();

export async function updateEpisodesRequest(
  showId: string,
  firstEpisode: number,
  lastEpisode: number,
  episodes: EpisodeInput[],
  awsRequestId: string
): Promise<Lambda.Types.InvocationResponse> {
  return lambda
    .invoke({
      FunctionName: config.updateShowDragonstoneFunctionName,
      Payload: JSON.stringify({ showId, firstEpisode, lastEpisode, episodes, requestStack: [awsRequestId] }),
      InvocationType: 'Event'
    })
    .promise();
}

export async function updateShowRequest(
  showId: string,
  showDef: ShowInput,
  awsRequestId: string
): Promise<Lambda.Types.InvocationResponse> {
  return lambda
    .invoke({
      FunctionName: config.updateShowDragonstoneFunctionName,
      Payload: JSON.stringify({ showId, showInput: showDef, requestStack: [awsRequestId] }),
      InvocationType: 'Event'
    })
    .promise();
}

export async function addShowRequest(showDef: ShowInput, awsRequestId: string): Promise<{ id: string }> {
  return lambda
    .invoke({
      FunctionName: config.addShowDragonstoneFunctionName,
      Payload: JSON.stringify({ showInput: showDef, requestStack: [awsRequestId] })
    })
    .promise()
    .then(requestResult => {
      let result: any;
      try {
        result = JSON.parse(result.Payload.toString())
      } catch (error) {
        throw new Error(`Can not parse response from Dragonston after adding show. Result: ${requestResult}`);
      }
      if (!result.ids || typeof result.ids.id === 'string') {
        throw new TypeError(`Response do not contain any id. Result: ${requestResult}`);
      }
      return { id: result.ids.id }
    });
}
