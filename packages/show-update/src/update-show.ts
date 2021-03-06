import { Logger } from '@episodehunter/logger';
import { Message, ShowId } from '@episodehunter/types';
import { groupArray, unixTimestamp } from '@episodehunter/utils';
import { fetchShow, getInformationFromTvDb, fetchLatestShowEpisodes } from './the-tv-db.util';
import { createPromiseBatch, sortEpisode } from './util';
import { addShowRequest, updateEpisodesRequest, updateShowRequest, updateShowMetadataRequest } from './dragonstone.util';
import { mapTheTvShowToDefinition, mapTheTvEpisodesToDefinition } from './mapper';

export async function updateShow(event: Message.UpdateShow.UpdateShow.Event, logger: Logger, awsRequestId: string) {
  const updatingShow = fetchShow(event.tvdbId, logger)
    .then(show => mapTheTvShowToDefinition(show))
    .then(async showDef => {
      if (event.lastupdated >= showDef.lastupdate) {
        logger.log(`Show has not been updated since last update id:${event.id} lastupdated:${event.lastupdated} tvdb:lastupdate:${showDef.lastupdate}`)
        await updateShowMetadataRequest(event.id, { lastupdateCheck: unixTimestamp() }, awsRequestId);
        return null;
      }
      return updateShowRequest(event.id, showDef, awsRequestId)
    });

  const updatingEpisodes = fetchLatestShowEpisodes(event.tvdbId, logger)
    .then(episodes => mapTheTvEpisodesToDefinition(episodes))
    .then(episodes => {
      sortEpisode(episodes);
      return filterEpisodesToUpdate(episodes, event.lastupdated);
    })
    .then(episodes => updateEpisodes(event.id, episodes, awsRequestId, logger));

  return Promise.all([updatingShow, updatingEpisodes]);
}

export async function addShow(
  tvDbId: number,
  logger: Logger,
  awsRequestId: string
): Promise<Message.UpdateShow.AddShow.Response> {
  const [theTvDbShow, theTVDbEpisodes] = await getInformationFromTvDb(tvDbId, logger);
  const showDef = mapTheTvShowToDefinition(theTvDbShow);
  const episodesDef = mapTheTvEpisodesToDefinition(theTVDbEpisodes);
  const dragsonstoneShow = await addShowRequest(showDef, awsRequestId);
  sortEpisode(episodesDef);
  await updateEpisodes(dragsonstoneShow.id, episodesDef, awsRequestId, logger);
  return dragsonstoneShow;
}

/**
 * The sns mesages size is pretty small so lets create several batches instead
 */
export async function updateEpisodes(
  showId: ShowId,
  episodes: Message.Dragonstone.EpisodeInput[],
  awsRequestId: string,
  logger: Logger
) {
  const pb = createPromiseBatch();
  for (let episodeGroup of groupArray(episodes, 200)) {
    const fisrtEpisodeInGroup = episodeGroup[0];
    const lastEpisodeInGroup = episodeGroup[episodeGroup.length - 1];
    pb.add(
      updateEpisodesRequest(
        showId,
        fisrtEpisodeInGroup.episodenumber,
        lastEpisodeInGroup.episodenumber,
        episodeGroup,
        awsRequestId,
        logger
      )
    );
  }
  return await pb.compleat();
}

/**
 * Find the first episode that needs to update and only take that one and the rest in order
 */
function filterEpisodesToUpdate(episodes: Message.Dragonstone.EpisodeInput[], lastupdate: Number) {
  const firstEpisodeIndex = episodes.findIndex(episode => episode.lastupdated > lastupdate);
  if (firstEpisodeIndex === -1) {
    // no match
    return [];
  }
  return episodes.slice(firstEpisodeIndex);
}
