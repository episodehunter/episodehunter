import { SNS } from 'aws-sdk';
import * as assertRequiredConfig from 'assert-env';

assertRequiredConfig(['EH_SNS_UPDATE_SHOW']);

const sns = new SNS();

export function publishUpdateShow(theTvDbId: number): Promise<SNS.PublishResponse> {
  // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#publish-property
  theTvDbId = theTvDbId | 0;
  if (theTvDbId < 1) {
    return;
  }
  const params = {
    TopicArn: process.env.EH_SNS_UPDATE_SHOW,
    Message: String(theTvDbId)
  };
  return new Promise((resolve, reject) => {
    sns.publish(params, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}
