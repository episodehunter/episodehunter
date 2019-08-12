// GET /series/{id}/episodes

export interface TheTvDbShowEpisodePage {
  links: {
    first: number
    last: number
    next: number
    prev: number
  }
  data: TheTvDbShowEpisode[]
}

export interface TheTvDbShowEpisode {
  airedEpisodeNumber: number
  airedSeason: number
  episodeName: string
  firstAired: string // 2010-12-05
  id: number
  lastUpdated: 1305321193
  overview: string
}
