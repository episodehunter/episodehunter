// GET episodes/{id}

export interface TheTvDbEpisode {
  id: number
  airedSeason: number
  airedSeasonID: number
  airedEpisodeNumber: number
  episodeName: string // Winter Is Coming
  firstAired: string // 2011-04-17
  guestStars: string[]
  director: string
  directors: string[]
  writers: string[]
  overview: string
  language: Language
  productionCode: string
  showUrl: string
  lastUpdated: number // 1433646412
  dvdDiscid: string
  dvdSeason: number
  dvdEpisodeNumber: number
  dvdChapter?: any
  absoluteNumber: number
  filename: string // episodes/121361/3254641.jpg
  seriesId: number
  lastUpdatedBy: number // 434798 (id)
  airsAfterSeason?: any
  airsBeforeSeason?: any
  airsBeforeEpisode?: any
  thumbAuthor: number
  thumbAdded: string
  thumbWidth: string
  thumbHeight: string
  imdbId: string
  siteRating: number
  siteRatingCount: number
}

export interface Language {
  episodeName: string // en
  overview: string // en
}
