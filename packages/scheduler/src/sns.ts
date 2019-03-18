import { SNS } from 'aws-sdk';
import { config } from './config';

const sns = new SNS();

export function publishUpdateShow(theTvDbId: number): Promise<SNS.PublishResponse> {
  // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#publish-property
  const params = {
    TopicArn: config.updateShowQueueName,
    Message: String(theTvDbId)
  };
  return sns.publish(params).promise();
}
