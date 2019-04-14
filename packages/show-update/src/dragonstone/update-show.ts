import { Logger } from '@episodehunter/logger';
import { getInformationFromTvDb } from '../the-tv-db.util';
import { calculateEpisodeNumber, createPromiseBatch, sortEpisode } from '../util';
import { addShowRequest, updateEpisodesRequest, updateShowRequest } from './dragonstone.util';
import { mapTheTvShowToDefinition } from './mapper';
import { EpisodeInput } from './types/episode.type';

export async function updateShow(ids: { id: string; tvdbId: number }, logger: Logger, awsRequestId: string) {
  const showDef = await getShow(ids.tvdbId, logger)
  return Promise.all([
    updateShowRequest(ids.id, showDef, awsRequestId),
    updateEpisodes(ids.id, showDef.episodes, awsRequestId, logger)
  ])
}

export async function addShow(tvDbId: number, logger: Logger, awsRequestId: string): Promise<{ id: string }> {
  const showDef = await getShow(tvDbId, logger)
  const show = await addShowRequest(showDef, awsRequestId)
  await updateEpisodes(show.id, showDef.episodes, awsRequestId, logger)
  return show;
}

async function getShow(tvDbId: number, logger: Logger) {
  const [tShow, tEpisodes] = await getInformationFromTvDb(tvDbId, logger);
  return mapTheTvShowToDefinition(tShow, tEpisodes);
}

export async function updateEpisodes(showId: string, episodes: EpisodeInput[], awsRequestId: string, logger: Logger) {
  let updatedEpisodes: EpisodeInput[] = [];
  sortEpisode(episodes);
  const pb = createPromiseBatch()
  for (let e of episodes) {
    if (updatedEpisodes.length >= 200) {
      pb.add(updateEpisodesRequest(
        showId,
        calculateEpisodeNumber(updatedEpisodes[0]),
        calculateEpisodeNumber(updatedEpisodes[updatedEpisodes.length - 1]),
        updatedEpisodes,
        awsRequestId,
        logger
      ))
      updatedEpisodes = []
    }
    updatedEpisodes.push(e)
  }
  if (updatedEpisodes.length > 0) {
    pb.add(updateEpisodesRequest(
      showId,
      calculateEpisodeNumber(updatedEpisodes[0]),
      calculateEpisodeNumber(updatedEpisodes[0]) * 2, // Add an empty space at the end
      updatedEpisodes,
      awsRequestId,
      logger
    ))
  }
  return await pb.compleat()
}
