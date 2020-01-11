import { Message } from '@episodehunter/types';
import { unixTimestamp } from '@episodehunter/utils';
import { ShowRecord, NewShowRecord } from '../schema';
import { RootShow } from '../../../resolvers/type';

export function mapShow(show?: ShowRecord | null): RootShow | null {
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
    lastupdatedCheck: show.lastupdated_check,
    name: show.name,
    network: show.network,
    overview: show.overview,
    runtime: show.runtime
  };
}

export function mapShowInputToShow(showInput: Message.Dragonstone.ShowInput): NewShowRecord;
export function mapShowInputToShow(showInput: Message.Dragonstone.ShowInput, showId: number): ShowRecord;
export function mapShowInputToShow(
  showInput: Message.Dragonstone.ShowInput,
  showId?: number
): NewShowRecord | ShowRecord {
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
    lastupdated_check: showInput.lastupdateCheck || unixTimestamp(),
    name: showInput.name,
    runtime: showInput.runtime
  };
  if (showId) {
    Object.assign(show, { id: showId });
  }
  return show;
}
