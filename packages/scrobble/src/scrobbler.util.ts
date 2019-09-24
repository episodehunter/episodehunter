import { Logger } from '@episodehunter/kingsguard'
import { WatchedEpisodeInput, WatchedEnum } from '@episodehunter/types/dragonstone'
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
  const watchedEpisode: WatchedEpisodeInput = {
    episodenumber,
    showId,
    time: unixTimestamp(),
    type: episodeInfo.sorce === 'kodi' ? WatchedEnum.KodiScrobble : WatchedEnum.PlexScrobble
  }
  return scrobbleEpisodeToDragonstone(
    watchedEpisode,
    apikey,
    username,
    requestId
  )
}
