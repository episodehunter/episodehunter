import { PublicTypes } from '../../../public';
import { Episode } from './episode.type';

export function mapEpisodes(episodes: Episode[]): PublicTypes.Episode[] {
  return episodes.map(mapEpisode) as PublicTypes.Episode[];
}

export function mapEpisode(episode?: Episode): PublicTypes.Episode | null {
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
