import { Dragonstone, Message } from '@episodehunter/types';
import { EpisodeRecord, NewEpisodeRecord } from '../schema';

export function mapEpisodes(episodes: (EpisodeRecord | null)[]): Dragonstone.Episode[] {
  return episodes.filter(Boolean).map(e => mapEpisode(e)) as any;
}

export function mapEpisode(episode: null): null;
export function mapEpisode(episode: undefined): null;
export function mapEpisode(episode: EpisodeRecord): Dragonstone.Episode;
export function mapEpisode(episode: EpisodeRecord | null): null;
export function mapEpisode(episode?: EpisodeRecord | null): Omit<Dragonstone.Episode, 'watched'> | null {
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
    overview: episode.overview || null
  };
}

export function mapEpisodeInputToEpisode(
  showId: number,
  episodeInput: Message.Dragonstone.EpisodeInput
): NewEpisodeRecord {
  const episode: NewEpisodeRecord = {
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
