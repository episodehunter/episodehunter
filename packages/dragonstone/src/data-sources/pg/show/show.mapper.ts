import { Dragonstone, Message, Omit } from '@episodehunter/types';
import { PgShow } from '../types';

export function mapShow(show?: PgShow): Dragonstone.Show | null {
  if (!show) {
    return null;
  }
  return {
    airs: {
      first: show.airs_first,
      time: show.airs_time,
      day: show.airs_day
    },
    ended: show.ended,
    genre: show.genre,
    ids: {
      id: show.id,
      imdb: show.external_id_imdb,
      tvdb: show.external_id_tvdb
    },
    language: show.language,
    lastupdated: show.lastupdated,
    name: show.name,
    network: show.network,
    overview: show.overview,
    runtime: show.runtime
  };
}

export function mapShowInputToShow(showInput: Message.Dragonstone.ShowInput): Omit<PgShow, 'id'>;
export function mapShowInputToShow(showInput: Message.Dragonstone.ShowInput, showId: number): PgShow;
export function mapShowInputToShow(
  showInput: Message.Dragonstone.ShowInput,
  showId?: number
): PgShow | Omit<PgShow, 'id'> {
  const show = {
    airs_day: showInput.airsDayOfWeek || null,
    airs_first: showInput.firstAired || null,
    airs_time: showInput.airsTime || null,
    external_id_imdb: showInput.imdbId || null,
    external_id_tvdb: showInput.tvdbId,
    language: showInput.language || null,
    network: showInput.network || null,
    overview: showInput.overview || null,
    ended: showInput.ended,
    genre: showInput.genre,
    lastupdated: showInput.lastupdate,
    name: showInput.name,
    runtime: showInput.runtime
  };
  if (showId) {
    Object.assign(show, { id: showId });
  }
  return show;
}
