import { Context } from 'aws-lambda';
import { GraphQLClient } from 'graphql-request';
import { config } from './config';
import { Title } from './types';
import { Logger } from '@episodehunter/logger';

const client = new GraphQLClient(config.dragonstoneUrl, {
  headers: { 'x-api-key': config.dragonstoneApiKey }
});

export async function updateTitles(context: Context): Promise<boolean> {
  const query = `
    mutation {
      updateTitles
    }
  `;
  client.setHeader('x-request-stack', context.awsRequestId);
  return client.request<{ updateTitles: boolean }>(query).then(result => result.updateTitles);
}

export async function getTitles(context: Context, logger: Logger): Promise<Title[]> {
  const query = `
    {
      titles {
        id
        tvdbId
      }
    }
  `;
  client.setHeader('x-request-stack', context.awsRequestId);
  logger.log('Send a request to dragonstone for titles');
  const result = await client.request<{ titles: Title[] }>(query)
  logger.log('We have a result from dragonstone. ' + result.titles.length);
  return result.titles;
}
