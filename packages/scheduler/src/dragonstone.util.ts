import { Logger } from '@episodehunter/logger';
import { Message } from '@episodehunter/types';
import { Context } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { GraphQLClient } from 'graphql-request';
import { config } from './config';
import { Title } from './types';

AWS.config.update({
  region: 'us-east-1'
});

const sns = new AWS.SNS();
const client = new GraphQLClient(config.dragonstoneUrl);

export async function getTitles(context: Context, logger: Logger): Promise<Title[]> {
  const query = `
    {
      titles {
        id
        tvdbId
        lastupdated
      }
    }
  `;
  client.setHeader('x-request-stack', context.awsRequestId);
  logger.log('Send a request to dragonstone for titles');
  const result = await client.request<{ titles: Title[] }>(query);
  logger.log('We have a result from dragonstone. ' + result.titles.length);
  return result.titles;
}

export function publishShowUpdate(event: Message.UpdateShow.UpdateShow.Event): Promise<AWS.SNS.PublishResponse> {
  // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#publish-property
  const params = {
    TopicArn: config.updateShowQueueName,
    Message: JSON.stringify(event)
  };
  return sns.publish(params).promise();
}
