import { Client } from 'pg';
import DataLoader from 'dataloader';
import { PgEpisode } from '../pg-types';

interface EpisodeKey {
  show_id: number;
  episodenumber: number;
}

export function createEpisodeLoader(client: Client) {
  const getBatchEpisodes = async (lookupKey: EpisodeKey[]): Promise<PgEpisode[]> => {
    const keys = lookupKey.map(key => `(${key.show_id | 0}, ${key.episodenumber | 0})`).join(', ');
    const dbResult = await client.query(`
      SELECT * FROM episodes
      WHERE (show_id, episodenumber) IN (${keys})
    `);
    return lookupKey.map(key => {
      return (
        dbResult.rows.find((row: PgEpisode) => {
          return row.show_id === key.show_id && row.episodenumber === key.episodenumber;
        }) || null
      );
    });
  };

  const cacheKeyFn = (lookupKey: EpisodeKey) => {
    return String(lookupKey.show_id + '_' + lookupKey.episodenumber);
  };

  return new DataLoader<EpisodeKey, PgEpisode>(getBatchEpisodes, {
    cacheKeyFn
  });
}

export type EpisodeLoader = DataLoader<EpisodeKey, PgEpisode>;
