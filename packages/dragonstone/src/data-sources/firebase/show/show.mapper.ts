import { PublicTypes } from '../../../public';
import { Show } from './show.types';
import { Episode } from '../episode/episode.type';
import { calculateEpisodeNumber } from '../../../util/util';

export function mapShow(show?: Show): PublicTypes.Show | null {
  if (!show) {
    return null;
  }
  return {
    airs: show.airs,
    ended: show.ended,
    genre: show.genre,
    ids: show.ids,
    language: show.language,
    lastupdated: show.lastupdated,
    name: show.name,
    network: show.network,
    numberOfFollowers: show.numberOfFollowers,
    overview: show.overview,
    runtime: show.runtime
  };
}

export function mapShowInputToShow(showId: string, showInput: PublicTypes.ShowInput): Show {
  const show: Show = {
    airs: {},
    ended: showInput.ended,
    genre: showInput.genre,
    ids: {
      id: showId,
      tvdb: showInput.tvdbId
    },
    lastupdated: showInput.lastupdate,
    name: showInput.name,
    overview: showInput.overview,
    runtime: showInput.runtime,
    numberOfFollowers: 0
  };
  if (showInput.airsDayOfWeek) {
    show.airs.day = showInput.airsDayOfWeek;
  }
  if (showInput.firstAired) {
    show.airs.first = showInput.firstAired;
  }
  if (showInput.airsTime) {
    show.airs.time = showInput.airsTime;
  }
  if (showInput.imdbId) {
    show.ids.imdb = showInput.imdbId;
  }
  if (showInput.language) {
    show.language = showInput.language;
  }
  if (showInput.network) {
    show.network = showInput.network;
  }
  if (showInput.network) {
    show.network = showInput.network;
  }
  return show;
}

export function mapEpisodeInputToEpisode(episodeInput: PublicTypes.EpisodeInput): Episode {
  const episode: Episode = {
    aired: episodeInput.firstAired,
    episode: episodeInput.episode,
    episodeNumber: calculateEpisodeNumber(episodeInput.season, episodeInput.episode),
    season: episodeInput.season,
    tvdbId: episodeInput.tvdbId,
    lastupdated: episodeInput.lastupdated,
    name: episodeInput.name
  };
  if (episodeInput.overview) {
    episode.overview = episodeInput.overview;
  }
  return episode;
}
