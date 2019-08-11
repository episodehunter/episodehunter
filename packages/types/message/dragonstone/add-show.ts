import { Show } from '../../dragonstone/show';
import { ShowInput } from './show-input';

export interface Event {
  showInput: ShowInput;
  requestStack: string[];
}

export type Response = Show;
