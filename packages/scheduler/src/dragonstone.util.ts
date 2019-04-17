import { Context } from 'aws-lambda';
import { GraphQLClient } from 'graphql-request';
import { config } from './config';
import { Logger } from '@episodehunter/logger';
import { Title } from './types';

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
