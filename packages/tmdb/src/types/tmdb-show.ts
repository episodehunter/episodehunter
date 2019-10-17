// GET /series/{id}

export interface TmdbShow {
  backdrop_path: string
  created_by: Createdby[]
  episode_run_time: number[]
  first_air_date: string
  genres: Genre[]
  homepage: string
  id: number
  in_production: boolean
  languages: string[]
  last_air_date: string
  last_episode_to_air: Lastepisodetoair
  name: string
  next_episode_to_air?: any
  networks: Network[]
  number_of_episodes: number
  number_of_seasons: number
  origin_country: string[]
  original_language: string
  original_name: string
  overview: string
  popularity: number
  poster_path: string
  production_companies: any[]
  seasons: Season[]
  status: string
  type: string
  vote_average: number
  vote_count: number
  external_ids: {
    imdb_id: string | null
    freebase_mid: string | null
    freebase_id: string | null
    tvdb_id: number | null
    tvrage_id: number | null
    facebook_id: string | null
    instagram_id: string | null
    twitter_id: string | null
  }
}

interface Season {
  air_date: string
  episode_count: number
  id: number
  name: string
  overview: string
  poster_path?: string
  season_number: number
}

interface Network {
  name: string
  id: number
  logo_path: string
  origin_country: string
}

interface Lastepisodetoair {
  air_date: string
  episode_number: number
  id: number
  name: string
  overview: string
  production_code: string
  season_number: number
  show_id: number
  still_path: string
  vote_average: number
  vote_count: number
}

interface Genre {
  id: number
  name: string
}

interface Createdby {
  id: number
  credit_id: string
  name: string
  gender: number
  profile_path?: string
}
