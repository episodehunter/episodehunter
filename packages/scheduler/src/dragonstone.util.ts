import { Context } from 'aws-lambda';
import { GraphQLClient } from 'graphql-request';
import { config } from './config';

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
