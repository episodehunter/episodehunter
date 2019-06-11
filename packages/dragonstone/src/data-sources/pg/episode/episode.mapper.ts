import { Dragonstone, Message } from '@episodehunter/types';
import { PgEpisode } from '../types';

export function mapEpisodes(episodes: PgEpisode[]): Dragonstone.Episode[] {
  return episodes.map(mapEpisode).filter(Boolean) as Dragonstone.Episode[];
}

export function mapEpisode(episode: PgEpisode): Dragonstone.Episode
export function mapEpisode(episode?: PgEpisode): Dragonstone.Episode | null {
  if (!episode) {
    return null;
  }
  return {
    aired: episode.first_aird,
    episodenumber: episode.episodenumber,
    lastupdated: episode.lastupdated,
    name: episode.name,
    overview: episode.overview || undefined,
  };
}

export function mapEpisodeInputToEpisode(showId: number, episodeInput: Message.Dragonstone.UpdateEpisodes.EpisodeInput): PgEpisode {
  const episode: PgEpisode = {
    first_aird: episodeInput.firstAired,
    episodenumber: episodeInput.episodenumber,
    overview: episodeInput.overview || null,
    lastupdated: episodeInput.lastupdated,
    name: episodeInput.name,
    show_id: showId
  };
  return episode;
}
