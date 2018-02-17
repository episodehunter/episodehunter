import { TheTvDbShow, TheTvDbShowEpisode } from '@episodehunter/types/thetvdb';
import { getInformationFromTvDb } from './the-tv-db.util';
import { ShowDefinitionType } from './types/show-definition.type';
import { EpisodeDefinitionType } from './types/episode-definition.type';
import { updateShowRequest } from './red-keep.util';
import { requestEpisodesImagesIfMissing, requestShowPosterIfMissing, requestShowFanartIfMissing } from './update-image';

function safeMap<T, R>(fu: (a: T) => R): (arr: T[]) => R[] {
  return (arr: T[]) => (Array.isArray(arr) ? arr.map(fu) : []);
}

function mapTheTvShowEpisodeToDefinition(tEpisodes: TheTvDbShowEpisode): EpisodeDefinitionType {
  return {
    tvdbId: tEpisodes.id,
    name: tEpisodes.episodeName,
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
    episodes: safeMap(mapTheTvShowEpisodeToDefinition)(tEpisodes)
  };
}

export function updateShow(tvDbId: number) {
  return getInformationFromTvDb(tvDbId)
    .then(([tShow, tEpisodes]) => mapTheTvShowToDefinition(tShow, tEpisodes))
    .then(showDef => updateShowRequest(showDef))
    .then(showDef =>
      Promise.all<any>([
        requestEpisodesImagesIfMissing(showDef.episodes),
        requestShowPosterIfMissing(showDef),
        requestShowFanartIfMissing(showDef)
      ])
    );
}
