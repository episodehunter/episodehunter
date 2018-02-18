import { SNS } from 'aws-sdk';

const sns = new SNS();

export function publishUpdateShow(theTvDbId: number): Promise<SNS.PublishResponse> {
  // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#publish-property
  const params = {
    TopicArn: process.env.EH_SNS_UPDATE_SHOW,
    Message: String(theTvDbId)
  };
  return sns.publish(params).promise();
}
