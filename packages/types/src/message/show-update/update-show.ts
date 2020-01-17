import { ShowId } from '../../types';

export interface Event {
  /**
   * Show id
   */
  id: ShowId;
  tvdbId: number;
  /**
   * Old name of the show
   * Using primarily in debug purpose
   */
  name?: string;
  /**
   * Unixtimestamp
   */
  lastupdated: number;
}
