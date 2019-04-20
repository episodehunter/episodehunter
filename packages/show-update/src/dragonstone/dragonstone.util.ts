import * as AWS from 'aws-sdk';
import { Lambda } from 'aws-sdk';
import { Dragonstone } from '@episodehunter/types/message';
import { config } from '../config';
import { Logger } from '@episodehunter/logger';

AWS.config.update({
  region: 'us-east-1'
});

const lambda = new AWS.Lambda();

export async function updateEpisodesRequest(
  showId: string,
  firstEpisode: number,
  lastEpisode: number,
  episodes: Dragonstone.UpdateEpisodes.EpisodeInput[],
  awsRequestId: string,
  logger: Logger
): Promise<Lambda.Types.InvocationResponse> {
  const event: Dragonstone.UpdateEpisodes.Event = { showId, firstEpisode, lastEpisode, episodes, requestStack: [awsRequestId] };
  logger.log(`Sending ${episodes.length} episodes to ${config.updateEpisodesDragonstoneFunctionName}`);
  return lambda
    .invoke({
      FunctionName: config.updateEpisodesDragonstoneFunctionName,
      Payload: JSON.stringify(event),
      InvocationType: 'Event'
    })
    .promise()
    .catch(error => {
      logger.log(
        `Could not create event to ${config.updateEpisodesDragonstoneFunctionName} with ${episodes.length} number of episodes`
      );
      throw error;
    });
}

export async function updateShowRequest(
  showId: string,
  showDef: Dragonstone.ShowInput,
  awsRequestId: string
): Promise<Lambda.Types.InvocationResponse> {
  const event: Dragonstone.UpdateShow.Event = { showId, showInput: showDef, requestStack: [awsRequestId] };
  return lambda
    .invoke({
      FunctionName: config.updateShowDragonstoneFunctionName,
      Payload: JSON.stringify(event),
      InvocationType: 'Event'
    })
    .promise();
}

export async function addShowRequest(showDef: Dragonstone.ShowInput, awsRequestId: string): Promise<{ id: string }> {
  const event: Dragonstone.AddShow.Event = { showInput: showDef, requestStack: [awsRequestId] };
  return lambda
    .invoke({
      FunctionName: config.addShowDragonstoneFunctionName,
      Payload: JSON.stringify(event)
    })
    .promise()
    .then(requestResult => {
      let result: Dragonstone.AddShow.Response;
      try {
        result = JSON.parse(requestResult.Payload.toString());
      } catch (error) {
        throw new Error(`Can not parse response from Dragonston after adding show. Result: ${JSON.stringify(requestResult)}`);
      }
      if (!result.ids || typeof result.ids.id !== 'string') {
        throw new TypeError(`Response do not contain any id. Result: ${JSON.stringify(requestResult)}`);
      }
      return { id: result.ids.id };
    });
}
