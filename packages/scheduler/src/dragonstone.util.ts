import { Message } from '@episodehunter/types';
import * as AWS from 'aws-sdk';
import { config } from './config';

AWS.config.update({
  region: 'us-east-1'
});

const sns = new AWS.SNS();
const lambda = new AWS.Lambda();

export async function getShowsToUpdate(requestId: string): Promise<Message.Dragonstone.NextShowToUpdate[]> {
  const event: Message.Dragonstone.NextToUpdateEvent = {
    limit: 10,
    requestStack: [requestId]
  }
  return lambda.invoke({
    Payload: JSON.stringify(event),
    FunctionName: config.nextToUpdateFunctionName,
    InvocationType: 'RequestResponse',
  }).promise().then(requestResult => {
    if (requestResult.FunctionError) {
      throw new Error(requestResult.FunctionError);
    }
    let result: Message.Dragonstone.NextToUpdateResponse;
    try {
      result = JSON.parse(requestResult.Payload!.toString());
    } catch (error) {
      throw new Error(`Can not parse response from Dragonston after requesting old shows. Result: ${JSON.stringify(requestResult)}`);
    }
    return result.shows;
  });
}

export function publishShowUpdate(event: Message.UpdateShow.UpdateShow.Event): Promise<AWS.SNS.PublishResponse> {
  // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#publish-property
  const params = {
    TopicArn: config.updateShowQueueName,
    Message: JSON.stringify(event)
  };
  return sns.publish(params).promise();
}
