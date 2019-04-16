import { Dragonstone, Message } from '@episodehunter/types';
import { calculateEpisodeNumber } from '../../../util/util';
import { Episode } from '../types';

export function mapEpisodes(episodes: Episode[]): Dragonstone.Episode[] {
  return episodes.map(mapEpisode) as Dragonstone.Episode[];
}

export function mapEpisode(episode?: Episode): Dragonstone.Episode | null {
  if (!episode) {
    return null;
  }
  return {
    aired: episode.aired || '',
    episode: Number(episode.episode),
    episodeNumber: Number(episode.episodeNumber),
    lastupdated: Number(episode.lastupdated),
    name: episode.name,
    overview: episode.overview,
    season: Number(episode.season),
    tvdbId: Number(episode.tvdbId)
  };
}

export function mapEpisodeInputToEpisode(episodeInput: Message.Dragonstone.UpdateEpisodes.EpisodeInput): Episode {
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
