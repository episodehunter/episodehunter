import { QueryConfig, Client } from 'pg';
import { sql, spreadInsert } from 'squid/pg';
import { NewEpisodeRecord } from '../schema';

export function update(table: string, id: number, obj: any): QueryConfig {
  const baseText = `UPDATE ${table} SET `;
  const args = [];
  const values = [id];
  let i = 2;
  for (let key in obj) {
    args.push(`${key} = $${i++}`);
    values.push(obj[key]);
  }
  const text = baseText + args.join(', ') + ' WHERE id = $1';
  return { text, values };
}

export function createEpisodeBatch(client: Client) {
  let episodesToInsert: NewEpisodeRecord[] = [];
  const stat = {
    deleted: 0,
    updated: 0,
    inserted: 0
  };
  const insertEpisodes = async () => {
    await client.query(
      sql`INSERT INTO episodes ${spreadInsert(...episodesToInsert)} ON CONFLICT (show_id, episodenumber) DO NOTHING`
    );
    episodesToInsert = [];
  }
  return {
    async begin() {
      await client.query('BEGIN');
    },
    async delete(showId: number, episodenumber: number) {
      stat.deleted++;
      await client.query(sql`DELETE FROM episodes WHERE episodenumber = ${episodenumber} and show_id = ${showId}`);
    },
    async insert(episode: NewEpisodeRecord) {
      stat.inserted++;
      episodesToInsert.push(episode);
      if (episodesToInsert.length >= 50) {
        await insertEpisodes();
      }
    },
    async update(episode: NewEpisodeRecord) {
      stat.updated++;
      await client.query(sql`
        UPDATE episodes SET name = ${episode.name}, first_aired = ${episode.first_aired}, overview = ${episode.overview}, lastupdated = ${episode.lastupdated}, external_id_tvdb = ${episode.external_id_tvdb} WHERE show_id = ${episode.show_id} AND episodenumber = ${episode.episodenumber}
      `);
    },
    async commit() {
      if (episodesToInsert.length > 0) {
        await insertEpisodes();
      }
      await client.query('COMMIT');
      return stat;
    }
  };
}
