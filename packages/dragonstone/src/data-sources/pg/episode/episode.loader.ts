import { Client } from 'pg';
import { sql } from "squid/pg"
import DataLoader from 'dataloader';
import { EpisodeRecord } from '../schema';

interface EpisodeKey {
  show_id: number;
  episodenumber: number;
}

export function createEpisodeLoader(client: Client) {
  const getBatchEpisodes = async (lookupKey: EpisodeKey[]): Promise<(EpisodeRecord | null)[]> => {
    const keys = lookupKey.map(key => `(${key.show_id | 0}, ${key.episodenumber | 0})`).join(', ');
    const dbResult = await client.query<EpisodeRecord>(sql`
      SELECT * FROM episodes
      WHERE (show_id, episodenumber) IN (${sql.raw(keys)})
    `);
    return lookupKey.map(key => {
      return (
        dbResult.rows.find(row => {
          return row.show_id === key.show_id && row.episodenumber === key.episodenumber;
        }) || null
      );
    });
  };

  const cacheKeyFn = (lookupKey: EpisodeKey) => {
    return String(lookupKey.show_id + '_' + lookupKey.episodenumber);
  };

  return new DataLoader<EpisodeKey, EpisodeRecord | null>(getBatchEpisodes, {
    cacheKeyFn
  });
}

export type EpisodeLoader = DataLoader<EpisodeKey, EpisodeRecord | null>;
