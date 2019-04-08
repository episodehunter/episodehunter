import * as AWS from 'aws-sdk';
import { Lambda } from 'aws-sdk';
import { config } from '../config';
import { ShowInput } from './types/show.type';

AWS.config.update({
  region: 'us-east-1'
});

const lambda = new AWS.Lambda();

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

export async function addShowRequest(showDef: ShowInput, awsRequestId: string): Promise<Lambda.Types.InvocationResponse> {
  return lambda
    .invoke({
      FunctionName: config.addShowDragonstoneFunctionName,
      Payload: JSON.stringify({ showInput: showDef, requestStack: [awsRequestId] }),
      InvocationType: 'Event'
    })
    .promise();
}
