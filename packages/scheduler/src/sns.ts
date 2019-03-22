import { SNS } from 'aws-sdk';
import { config } from './config';
import { Title } from './types';

const sns = new SNS();

// This is deprecated
export function publishUpdateShow(theTvDbId: number): Promise<SNS.PublishResponse> {
  // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#publish-property
  const params = {
    TopicArn: config.updateShowQueueName,
    Message: String(theTvDbId)
  };
  return sns.publish(params).promise();
}

export function publishShowUpdate(title: Title): Promise<SNS.PublishResponse> {
  // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#publish-property
  const params = {
    TopicArn: config.updateShowTopic,
    Message: JSON.stringify(title)
  };
  return sns.publish(params).promise();
}
