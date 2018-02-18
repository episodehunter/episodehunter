import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient(process.env.EH_RED_KEEP_API, {
  headers: { Authorization: `Bearer ${process.env.EH_RED_KEEP_TOKEN}` }
});

export function getExistingShows(tvdbIds: number[]) {
  const query = `
    query GetExistingShows($tvdbIds: [Int]!) {
      existingShows(tvdbIds: $tvdbIds) {
        tvdbId
      }
    }
  `;
  return client.request<{ existingShows: { tvdbId: number }[] }>(query, { tvdbIds }).then(result => result.existingShows);
}
