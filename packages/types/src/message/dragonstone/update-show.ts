import { RootShow } from '../../root-types';
import { ShowId } from '../../types';
import { ShowInput } from './show-input';

export interface UpdateShowEvent {
  showId: ShowId;
  showInput: ShowInput;
  requestStack: string[];
}

export type UpdateShowResponse = RootShow | null;
