export interface UpdateResponse {
  data: UpdatedId[];
}

export interface UpdatedId {
  id: number;
  lastUpdated: number;
}
