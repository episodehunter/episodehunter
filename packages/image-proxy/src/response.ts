import { config } from './config';

export interface Response {
  statusCode: '400' | '404' | '301' | '200',
  headers: {} | { location: string },
  body: ''
}

export const BAD_REQUEST_RESPONSE: Response = {
  statusCode: '400',
  headers: {},
  body: ''
};

export const NOT_FOUND_RESPONSE: Response = {
  statusCode: '404',
  headers: {},
  body: ''
};

export function createMoveResponse(key: string): Response {
  return {
    statusCode: '301',
    headers: { location: `${config.bucketUrl}/${key}` },
    body: ''
  };
}
