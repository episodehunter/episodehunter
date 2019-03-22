import { GraphQLClient } from 'graphql-request';
import { ShowInput, Show } from './types/show.type';
import { config } from '../config';

const client = new GraphQLClient(config.dragonstoneUrl, {
  headers: { 'x-api-key': config.dragonstoneApiKey }
});

class DragonstoneError extends Error {
  constructor(msg: string, extra: Object) {
    super(msg);
    (this as any).extra = extra;
  }
}

function handleError(error: any) {
  if (error && error.response && error.response.errors && error.response.errors.length) {
    return Promise.reject(new DragonstoneError(error.response.errors[0].message, error.response.errors[0]));
  }
  return Promise.reject(error);
}

export async function updateShowRequest(showDef: ShowInput, awsRequestId: string): Promise<Show | null> {
  const query = `
    mutation UpdateShow($showInput: ShowInput!) {
      showUpdate(show: $showInput) {
        ids {
          id
          tvdb
        }
        name
      }
    }
  `;
  client.setHeader('x-request-stack', awsRequestId);
  return client
    .request<{ showUpdate: Show }>(query, { showInput: showDef })
    .then(result => result.showUpdate)
    .catch(handleError);
}

export async function addShowRequest(showDef: ShowInput, awsRequestId: string): Promise<string | null> {
  const query = `
    mutation AddShow($showInput: ShowInput!) {
      showAdd(show: $showInput) {
        ids {
          id
        }
      }
    }
  `;
  client.setHeader('x-request-stack', awsRequestId);
  return client
    .request<{ showAdd: Show | null }>(query, { showInput: showDef })
    .then(result => (result.showAdd && result.showAdd.ids.id) || null)
    .catch(handleError);
}
