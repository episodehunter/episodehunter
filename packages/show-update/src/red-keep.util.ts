import { GraphQLClient } from 'graphql-request';
import { gql } from './gql';
import { ShowDefinitionType } from './types/show-definition.type';

const client = new GraphQLClient(process.env.EH_RED_KEEP_URL, {
  headers: { Authorization: `Bearer ${process.env.EH_RED_KEEP_TOKEN}` }
});

class RedKeepError extends Error {
  constructor(msg: string, extra: Object) {
    super(msg);
    (this as any).extra = extra;
  }
}

function handleError(error: any) {
  if (error && error.response && error.response.errors && error.response.errors.length) {
    return Promise.reject(new RedKeepError(error.response.errors[0].message, error.response.errors[0]));
  }
  return Promise.reject(error);
}

export function updateShowRequest(showDef: ShowDefinitionType) {
  const query = gql`
    mutation UpdateShow($showInput: ShowInput!) {
      showUpdate(show: $showInput) {
        id
      }
    }
  `;
  return client
    .request<{ showUpdate: ShowDefinitionType }>(query, { showInput: showDef })
    .then(result => result.showUpdate)
    .catch(handleError);
}

export function addShowRequest(showDef: ShowDefinitionType) {
  const query = gql`
    mutation AddShow($showInput: ShowInput!) {
      showAdd(show: $showInput) {
        id
      }
    }
  `;
  return client
    .request<{ addShow: { id: number } }>(query, { showInput: showDef })
    .then(result => result.addShow.id)
    .catch(handleError);
}
