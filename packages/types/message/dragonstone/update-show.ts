import { Show } from '../../dragonstone/show';
import { ShowInput } from './show-input';
import { ShowId } from '../../types';

export interface Event {
  showId: ShowId;
  showInput: ShowInput;
  requestStack: string[];
}

export type Response = Show | null;
