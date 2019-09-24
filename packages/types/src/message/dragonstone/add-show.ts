import { RootShow } from '../../root-types';
import { ShowInput } from './show-input';

export interface AddShowEvent {
  showInput: ShowInput;
  requestStack: string[];
}

export type AddShowResponse = RootShow;
