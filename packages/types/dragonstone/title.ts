import { ShowId } from '../types';

export interface Title {
  id: ShowId;
  name: string;
  followers: number;
  tvdbId: number;
  lastupdated: number;
}
