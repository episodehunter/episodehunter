import { Logger } from '@episodehunter/kingsguard'
import { Dragonstone } from '@episodehunter/types'
import { calculateEpisodeNumber, unixTimestamp } from '@episodehunter/utils'
import {
  getShowId,
  scrobbleEpisode as scrobbleEpisodeToDragonstone
} from './dragonstone.util'
import { EpisodeInformation } from './parse.util'

export async function scrobbleEpisode(
  username: string,
  apikey: string,
  episodeInfo: EpisodeInformation,
  log: Logger,
  requestId: string
): Promise<null> {
  const episodenumber = calculateEpisodeNumber(
    episodeInfo.season,
    episodeInfo.episode
  )
  const showId = await getShowId(episodeInfo.id, requestId, log)
  const watchedEpisode: Dragonstone.WatchedEpisode.WatchedEpisodeInput = {
    episodenumber,
    showId,
    time: unixTimestamp(),
    type: episodeInfo.sorce === 'kodi' ? 'kodiScrobble' : 'plexScrobble'
  }
  return scrobbleEpisodeToDragonstone(
    watchedEpisode,
    apikey,
    username,
    requestId
  )
}
