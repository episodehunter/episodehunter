import { MediaProvider, KodiEpisodeEvent, KodiMovieEvent } from './types'

export interface EpisodeInformation {
  provider: MediaProvider
  /**
   * Show id
   */
  id: number
  /**
   * Season number
   */
  season: number
  /**
   * Episode number
   */
  episode: number
  /**
   * Episode number
   */
  sorce: 'plex' | 'kodi'
}

export function plexEpisodeParse(payload: string): EpisodeInformation | null {
  const match = /com\.plexapp\.agents\.(.+):\/\/([a-zA-Z0-9]+)\/(\d+)\/(\d+).+/g.exec(
    payload
  )
  if (match) {
    return {
      provider: match[1] as MediaProvider,
      id: (match[2] as any) | 0,
      season: (match[3] as any) | 0,
      episode: (match[4] as any) | 0,
      sorce: 'plex'
    }
  }
  return null
}

export function isKodiEpisode(
  event: KodiEpisodeEvent | KodiMovieEvent
): event is KodiEpisodeEvent {
  return event.media_type === 'episode' || isKodiScrobleEpisode(event)
}

// There is a bug in the Kodi addon that will mark an episode as an movie when scroble
function isKodiScrobleEpisode(
  event: KodiEpisodeEvent | KodiMovieEvent
): event is KodiEpisodeEvent {
  return (
    event.media_type === 'movie' &&
    event.hasOwnProperty('episode') &&
    event.hasOwnProperty('season')
  )
}

export function parseJson(jsonStr: string | null) {
  if (!jsonStr) {
    return null
  }
  try {
    return JSON.parse(jsonStr)
  } catch (error) {
    return null
  }
}
