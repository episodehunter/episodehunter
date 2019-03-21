import { Logger } from '@episodehunter/kingsguard';
import { TheTvDbShow, TheTvDbShowEpisode } from '@episodehunter/thetvdb';
import { getInformationFromTvDb } from '../the-tv-db.util';
import { ShowDefinitionType } from './types/show-definition.type';
import { EpisodeDefinitionType } from './types/episode-definition.type';
import { updateShowRequest, addShowRequest } from './red-keep.util';
import { InsufficientShowInformation } from '../custom-erros';

function safeMap<T, R>(fu: (a: T) => R): (arr: T[]) => R[] {
  return (arr: T[]) => (Array.isArray(arr) ? arr.map(fu) : []);
}

function safeFilter<T>(fu: (a: T) => boolean): (arr: T[]) => T[] {
  return (arr: T[]) => (Array.isArray(arr) ? arr.filter(fu) : []);
}

function isValidEpisode(episode: TheTvDbShowEpisode): boolean {
  return Boolean(episode.id && episode.airedEpisodeNumber && episode.airedSeason && episode.lastUpdated && episode.firstAired);
}

function assertShow(show: TheTvDbShow) {
  if (Boolean(show.seriesName && show.id && show.lastUpdated)) {
    return show;
  }
  throw new InsufficientShowInformation('Insufficient information about show ' + show.id);
}

function mapTheTvShowEpisodeToDefinition(tEpisodes: TheTvDbShowEpisode): EpisodeDefinitionType {
  return {
    tvdbId: tEpisodes.id,
    name: tEpisodes.episodeName || `Episode #${tEpisodes.airedSeason}.${tEpisodes.airedEpisodeNumber}`,
    season: tEpisodes.airedSeason,
    episode: tEpisodes.airedEpisodeNumber,
    firstAired: tEpisodes.firstAired,
    overview: tEpisodes.overview,
    lastupdated: tEpisodes.lastUpdated
  };
}

function mapTheTvShowToDefinition(tShow: TheTvDbShow, tEpisodes: TheTvDbShowEpisode[]): ShowDefinitionType {
  return {
    tvdbId: tShow.id,
    imdbId: tShow.imdbId,
    name: tShow.seriesName,
    airsDayOfWeek: tShow.airsDayOfWeek,
    airsTime: tShow.airsTime,
    firstAired: tShow.firstAired,
    genre: tShow.genre,
    network: tShow.network,
    overview: tShow.overview,
    runtime: (tShow.runtime as any | 0) || undefined,
    ended: tShow.status === 'Ended',
    lastupdate: tShow.lastUpdated,
    episodes: safeMap(mapTheTvShowEpisodeToDefinition)(safeFilter(isValidEpisode)(tEpisodes))
  };
}

export function updateShow(tvDbId: number, logger: Logger, awsRequestId: string) {
  const tapLogger = (msg: string) => <T>(value: T): T => {
    logger.log(msg);
    return value;
  };
  return getInformationFromTvDb(tvDbId, logger)
    .then(tapLogger('Got information from the tv db, start mapping'))
    .then(([tShow, tEpisodes]) => mapTheTvShowToDefinition(assertShow(tShow), tEpisodes))
    .then(tapLogger('Update show in red keep'))
    .then(showDef => updateShowRequest(showDef, awsRequestId))
    .then(tapLogger('Done and done!'));
}

export function addShow(tvDbId: number, logger: Logger, awsRequestId: string) {
  return getInformationFromTvDb(tvDbId, logger)
    .then(([tShow, tEpisodes]) => mapTheTvShowToDefinition(assertShow(tShow), tEpisodes))
    .then(showDef => addShowRequest(showDef, awsRequestId));
}
