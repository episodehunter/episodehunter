import { TheTvDbShow, TheTvDbShowEpisode } from "@episodehunter/thetvdb";
import { ShowInput } from "./types/show.type";
import { EpisodeInput } from "./types/episode.type";
import { safeMap, safeFilter, isValidEpisode } from "../util";

function mapTheTvShowEpisodeToDefinition(tEpisodes: TheTvDbShowEpisode): EpisodeInput {
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

export function mapTheTvShowToDefinition(tShow: TheTvDbShow, tEpisodes: TheTvDbShowEpisode[]): ShowInput {
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
    lastupdate: tShow.lastUpdated,
    episodes: safeMap(mapTheTvShowEpisodeToDefinition)(safeFilter(isValidEpisode)(tEpisodes))
  };
}