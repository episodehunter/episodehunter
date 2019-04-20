import { TheTvDbShow, TheTvDbShowEpisode } from '@episodehunter/thetvdb';
import { Message } from '@episodehunter/types';
import { safeMap, safeFilter, isValidEpisode } from '../util';

export function mapTheTvEpisodesToDefinition(tEpisodes: TheTvDbShowEpisode[]): Message.Dragonstone.UpdateEpisodes.EpisodeInput[] {
  return safeMap(mapTheTvEpisodeToDefinition)(safeFilter(isValidEpisode)(tEpisodes));
}

export function mapTheTvShowToDefinition(tShow: TheTvDbShow): Message.Dragonstone.ShowInput {
  return {
    tvdbId: tShow.id,
    imdbId: tShow.imdbId,
    name: tShow.seriesName,
    airsDayOfWeek: mapDayToNumber(tShow.airsDayOfWeek),
    airsTime: tShow.airsTime,
    firstAired: tShow.firstAired,
    genre: tShow.genre,
    network: tShow.network,
    overview: tShow.overview,
    runtime: (tShow.runtime as any) | 0,
    ended: tShow.status === 'Ended',
    lastupdate: tShow.lastUpdated
  };
}

function mapTheTvEpisodeToDefinition(tEpisodes: TheTvDbShowEpisode): Message.Dragonstone.UpdateEpisodes.EpisodeInput {
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

const dayOfWeekString = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6
};

function mapDayToNumber(day?: string): number | undefined {
  if (!day) {
    return;
  }
  return dayOfWeekString[day];
}
