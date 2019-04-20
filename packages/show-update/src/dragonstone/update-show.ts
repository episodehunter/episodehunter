import { Logger } from '@episodehunter/logger';
import { Message } from '@episodehunter/types';
import { fetchShow, fetchShowEpisodes } from '../the-tv-db.util';
import { calculateEpisodeNumber, createPromiseBatch, sortEpisode, groupArray } from '../util';
import { addShowRequest, updateEpisodesRequest, updateShowRequest } from './dragonstone.util';
import { mapTheTvShowToDefinition, mapTheTvEpisodesToDefinition } from './mapper';

export async function updateShow(event: Message.UpdateShow.UpdateShow.Event, logger: Logger, awsRequestId: string) {
  const updatingShow = fetchShow(event.tvdbId, logger)
    .then(show => mapTheTvShowToDefinition(show))
    .then(showDef => updateShowRequest(event.id, showDef, awsRequestId));

  const updatingEpisodes = fetchShowEpisodes(event.tvdbId, logger)
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
  const [theTvDbShow, theTVDbEpisodes] = await Promise.all([fetchShow(tvDbId, logger), fetchShowEpisodes(tvDbId, logger)]);
  const showDef = mapTheTvShowToDefinition(theTvDbShow);
  const episodesDef = mapTheTvEpisodesToDefinition(theTVDbEpisodes);
  const dragsonstoneShow = await addShowRequest(showDef, awsRequestId);
  sortEpisode(episodesDef);
  await updateEpisodes(dragsonstoneShow.id, episodesDef, awsRequestId, logger);
  return dragsonstoneShow;
}

export async function updateEpisodes(
  showId: string,
  episodes: Message.Dragonstone.UpdateEpisodes.EpisodeInput[],
  awsRequestId: string,
  logger: Logger
) {
  const pb = createPromiseBatch();
  for (let episodeGroup of groupArray(episodes, 200)) {
    pb.add(
      updateEpisodesRequest(
        showId,
        calculateEpisodeNumber(episodeGroup[0]),
        calculateEpisodeNumber(episodeGroup[episodeGroup.length - 1]),
        episodeGroup,
        awsRequestId,
        logger
      )
    );
  }
  return await pb.compleat();
}

function filterEpisodesToUpdate(episodes: Message.Dragonstone.UpdateEpisodes.EpisodeInput[], lastupdate: Number) {
  const firstEpisodeIndex = episodes.findIndex(episode => episode.lastupdated > lastupdate);
  return episodes.slice(firstEpisodeIndex);
}
