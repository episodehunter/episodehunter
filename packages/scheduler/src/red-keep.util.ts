import { Context } from 'aws-lambda';
import { GraphQLClient } from 'graphql-request';
import { config } from './config';

const client = new GraphQLClient(config.redKeepUrl, {
  headers: { 'api-key': config.redKeepApiKey }
});

export function getExistingShows(tvdbIds: number[], context: Context) {
  const query = `
    query GetExistingShows($tvdbIds: [Int]!) {
      existingShows(tvdbIds: $tvdbIds) {
        tvdbId
      }
    }
  `;
  client.setHeader('request-id', context.awsRequestId);
  return client.request<{ existingShows: { tvdbId: number }[] }>(query, { tvdbIds }).then(result => result.existingShows);
}
