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
      updateShow(show: $showInput) {
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
    .request<{ updateShow: Show | null }>(query, { showInput: showDef })
    .then(result => result.updateShow)
    .catch(handleError);
}

export async function addShowRequest(showDef: ShowInput, awsRequestId: string): Promise<string | null> {
  const query = `
    mutation AddShow($showInput: ShowInput!) {
      addShow(show: $showInput) {
        ids {
          id
        }
      }
    }
  `;
  client.setHeader('x-request-stack', awsRequestId);
  return client
    .request<{ addShow: Show | null }>(query, { showInput: showDef })
    .then(result => (result.addShow && result.addShow.ids.id) || null)
    .catch(handleError);
}
