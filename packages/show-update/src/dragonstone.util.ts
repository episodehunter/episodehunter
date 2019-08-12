import { Logger } from '@episodehunter/logger';
import { ShowId } from '@episodehunter/types';
import * as AddShow from '@episodehunter/types/message/dragonstone/add-show';
import { ShowInput } from '@episodehunter/types/message/dragonstone/show-input';
import * as UpdateEpisode from '@episodehunter/types/message/dragonstone/update-episodes';
import * as UpdateShow from '@episodehunter/types/message/dragonstone/update-show';
import * as AWS from 'aws-sdk';
import { config } from './config';

AWS.config.update({
  region: 'us-east-1'
});

const lambda = new AWS.Lambda();

export async function updateEpisodesRequest(
  showId: ShowId,
  firstEpisode: number,
  lastEpisode: number,
  episodes: UpdateEpisode.EpisodeInput[],
  awsRequestId: string,
  logger: Logger
): Promise<AWS.Lambda.Types.InvocationResponse> {
  const event: UpdateEpisode.Event = { showId, firstEpisode, lastEpisode, episodes, requestStack: [awsRequestId] };
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
  showId: ShowId,
  showDef: ShowInput,
  awsRequestId: string
): Promise<AWS.Lambda.Types.InvocationResponse> {
  const event: UpdateShow.Event = { showId, showInput: showDef, requestStack: [awsRequestId] };
  return lambda
    .invoke({
      FunctionName: config.updateShowDragonstoneFunctionName,
      Payload: JSON.stringify(event),
      InvocationType: 'Event'
    })
    .promise();
}

export async function addShowRequest(showDef: ShowInput, awsRequestId: string): Promise<{ id: ShowId }> {
  const event: AddShow.Event = { showInput: showDef, requestStack: [awsRequestId] };
  return lambda
    .invoke({
      FunctionName: config.addShowDragonstoneFunctionName,
      Payload: JSON.stringify(event)
    })
    .promise()
    .then(requestResult => {
      let result: AddShow.Response;
      try {
        result = JSON.parse(requestResult.Payload!.toString());
      } catch (error) {
        throw new Error(`Can not parse response from Dragonston after adding show. Result: ${JSON.stringify(requestResult)}`);
      }
      if (!result.ids || !result.ids.id) {
        throw new TypeError(`Response do not contain any id. Result: ${JSON.stringify(requestResult)}`);
      }
      return { id: result.ids.id };
    });
}
