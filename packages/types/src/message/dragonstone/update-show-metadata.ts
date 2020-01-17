import { ShowId } from '../../types';

export interface ShowMetadata {
  lastupdate?: number;
  lastupdateCheck?: number;
  disableUpdate?: boolean;
}

export interface UpdateShowMetadataEvent {
  showId: ShowId;
  metadata: ShowMetadata;
  requestStack: string[];
}

export type UpdateShowMetadataResponse = boolean;
