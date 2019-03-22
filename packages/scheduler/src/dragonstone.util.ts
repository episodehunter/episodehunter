import { Context } from 'aws-lambda';
import { GraphQLClient } from 'graphql-request';
import { config } from './config';
import { Title } from './types';

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

export async function getTitles(context: Context): Promise<Title[]> {
  const query = `
    {
      titles {
        id
        tvdbId
      }
    }
  `;
  client.setHeader('x-request-stack', context.awsRequestId);
  return client.request<{ titles: Title[] }>(query).then(result => result.titles);
}
