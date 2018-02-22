import { GraphQLClient } from 'graphql-request';
import { gql } from './gql';
import { ShowDefinitionType } from './types/show-definition.type';

const client = new GraphQLClient(process.env.EH_RED_KEEP_URL, {
  headers: { Authorization: `Bearer ${process.env.EH_RED_KEEP_TOKEN}` }
});

export function updateShowRequest(showDef: ShowDefinitionType) {
  const query = gql`
    mutation UpdateShow($showInput: ShowInput!) {
      showUpdate(show: $showInput) {
        id
      }
    }
  `;
  return client.request<{ showUpdate: ShowDefinitionType }>(query, { showInput: showDef }).then(result => result.showUpdate);
}
