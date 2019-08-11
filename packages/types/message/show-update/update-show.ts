import { ShowId } from '../../types';

export interface Event {
  /**
   * Show id
   */
  id: ShowId;
  tvdbId: number;
  /**
   * Unixtimestamp
   */
  lastupdated: number;
}
