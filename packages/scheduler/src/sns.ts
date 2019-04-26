import { SNS } from 'aws-sdk';
import { Message } from '@episodehunter/types';
import { config } from './config';

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

export function publishShowUpdate(title: Message.UpdateShow.Event): Promise<SNS.PublishResponse> {
  // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#publish-property
  const event: Message.UpdateShow.Event = title;
  const params = {
    TopicArn: config.updateShowTopic,
    Message: JSON.stringify(event)
  };
  return sns.publish(params).promise();
}
