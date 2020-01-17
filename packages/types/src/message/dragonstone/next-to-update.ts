export interface NextShowToUpdate {
  id: number;
  name: string;
  tvdbId: number;
  lastupdated: number;
  lastupdatedCheck: number;
}

export interface NextToUpdateEvent {
  limit: number;
  requestStack: string[];
}

export interface NextToUpdateResponse {
  shows: NextShowToUpdate[];
}
