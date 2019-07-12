import { Dragonstone, Message } from '@episodehunter/types';
import { PgEpisode } from '../pg-types';

export function mapEpisodes(episodes: (PgEpisode | null)[]): Dragonstone.Episode[] {
  return episodes.filter(Boolean).map(e => mapEpisode(e)) as any;
}

export function mapEpisode(episode: null): null;
export function mapEpisode(episode: undefined): null;
export function mapEpisode(episode: PgEpisode): Dragonstone.Episode;
export function mapEpisode(episode: PgEpisode | null): null;
export function mapEpisode(episode?: PgEpisode | null): Dragonstone.Episode | null {
  if (!episode) {
    return null;
  }
  return {
    ids: {
      showId: episode.show_id,
      tvdb: episode.external_id_tvdb
    },
    aired: episode.first_aired,
    episodenumber: episode.episodenumber,
    lastupdated: episode.lastupdated,
    name: episode.name,
    overview: episode.overview || undefined
  };
}

export function mapEpisodeInputToEpisode(
  showId: number,
  episodeInput: Message.Dragonstone.UpdateEpisodes.EpisodeInput
): PgEpisode {
  const episode: PgEpisode = {
    first_aired: episodeInput.firstAired,
    episodenumber: episodeInput.episodenumber,
    overview: episodeInput.overview || null,
    lastupdated: episodeInput.lastupdated,
    name: episodeInput.name,
    show_id: showId,
    external_id_tvdb: episodeInput.tvdbId
  };
  return episode;
}
