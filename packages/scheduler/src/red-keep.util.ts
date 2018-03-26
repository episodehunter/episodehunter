import { Context } from '@episodehunter/kingsguard';
import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient(process.env.EH_RED_KEEP_URL, {
  headers: { 'api-key': process.env.EH_RED_API_KEY }
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
