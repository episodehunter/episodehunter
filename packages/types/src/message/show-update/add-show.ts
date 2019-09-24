import { ShowId } from '../../types';

export interface Event {
  theTvDbId: number;
  requestStack: string[];
}

export interface Response {
  id: ShowId;
}
