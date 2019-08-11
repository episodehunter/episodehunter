import { ShowId } from '../types';

export interface Title {
  /**
   * Show id
   */
  id: ShowId;
  name: string;
  followers: number;
  tvdbId: number;
  /**
   * Unixtimestamp
   */
  lastupdated: number;
}
