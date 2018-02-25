// GET updated/query?fromTime={time}

export interface TheTvDbUpdatedShows {
  data: TheTvDbUpdatedShowId[]
}

export interface TheTvDbUpdatedShowId {
  id: number
  lastUpdated: number
}
