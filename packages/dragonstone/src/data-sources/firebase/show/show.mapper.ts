import { PublicTypes, Omit } from '../../../public';
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
  return {
    airs: {
      day: showInput.airsDayOfWeek,
      first: showInput.firstAired,
      time: showInput.airsTime
    },
    ended: showInput.ended,
    genre: showInput.genre,
    ids: {
      id: showId,
      imdb: showInput.imdbId,
      tvdb: showInput.tvdbId
    },
    language: showInput.language,
    lastupdated: showInput.lastupdate,
    name: showInput.name,
    network: showInput.network,
    overview: showInput.overview,
    runtime: showInput.runtime,
    numberOfFollowers: 0
  };
}

export function mapEpisodeInputToEpisode(episodeInput: PublicTypes.EpisodeInput): Episode {
  return {
    aired: episodeInput.firstAired,
    episode: episodeInput.episode,
    episodeNumber: calculateEpisodeNumber(episodeInput.season, episodeInput.episode),
    season: episodeInput.season,
    tvdbId: episodeInput.tvdbId,
    lastupdated: episodeInput.lastupdated,
    name: episodeInput.name,
    overview: episodeInput.overview
  };
}
