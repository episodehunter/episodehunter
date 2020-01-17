import { TitleRecord, ShowRecord } from '../schema';
import { Dragonstone, Message } from '@episodehunter/types';

export function mapTitles(titles: TitleRecord[]): Dragonstone.Title[] {
  return titles.map(pgTitle => ({
    id: pgTitle.id,
    name: pgTitle.name,
    followers: pgTitle.followers,
    tvdbId: pgTitle.external_id_tvdb,
    lastupdated: pgTitle.lastupdated
  }));
}

export function mapNextShowToUpdate(
  shows: Pick<ShowRecord, 'id' | 'name' | 'external_id_tvdb' | 'lastupdated' | 'lastupdated_check'>[]
): Message.Dragonstone.NextShowToUpdate[] {
  return shows.map(pgShow => ({
    id: pgShow.id,
    name: pgShow.name,
    tvdbId: pgShow.external_id_tvdb,
    lastupdated: pgShow.lastupdated,
    lastupdatedCheck: pgShow.lastupdated_check
  }));
}
