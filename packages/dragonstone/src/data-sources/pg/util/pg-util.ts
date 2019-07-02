import { QueryConfig, Client } from 'pg';
import { PgEpisode } from '../types';

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

export function updateEpisode(episode: PgEpisode): QueryConfig {
  return {
    text: `UPDATE episodes SET name = $1, first_aird = $2, overview = $3, lastupdated = $4 WHERE show_id = $5 AND episodenumber = $6`,
    values: [
      episode.name,
      episode.first_aired,
      episode.overview,
      episode.lastupdated,
      episode.show_id,
      episode.episodenumber
    ]
  };
}

type rowValues = string | number | null;

export function insert(table: string, obj: Record<string, rowValues>): QueryConfig {
  return inserts(table, [obj]);
}

export function insertAndReturn(table: string, obj: Record<string, rowValues>): QueryConfig {
  const query = inserts(table, [obj]);
  query.text += ` RETURNING *`;
  return query;
}

export function inserts(table: string, obj: Record<string, rowValues>[]): QueryConfig {
  const columnNames = Object.keys(obj[0]);
  const rowsToInsert: rowValues[][] = [];
  for (let row of obj) {
    const rowToInsert: rowValues[] = [];
    for (let key of columnNames) {
      rowToInsert.push(row[key]);
    }
    rowsToInsert.push(rowToInsert);
  }

  const text = `INSERT INTO ${table} (${columnNames.join(', ')}) VALUES ${expand(
    rowsToInsert.length,
    columnNames.length
  )}`;
  return { text, values: flatten(rowsToInsert) };
}

function insertEpisodes(obj: PgEpisode[]): QueryConfig {
  const query = inserts('episodes', obj as any);
  query.text += ` ON CONFLICT ON CONSTRAINT uniq_episode DO NOTHING`;
  return query;
}

function expand(rowCount: number, columnCount: number, startAt = 1): string {
  let index = startAt;
  return Array(rowCount)
    .fill(0)
    .map(
      () =>
        `(${Array(columnCount)
          .fill(0)
          .map(() => `$${index++}`)
          .join(', ')})`
    )
    .join(', ');
}

function flatten<T>(arr: T[][]): T[] {
  const newArr: T[] = [];
  arr.forEach(v => v.forEach(p => newArr.push(p)));
  return newArr;
}

export function createEpisodeBatch(client: Client) {
  let episodesToInsert: PgEpisode[] = [];
  const stat = {
    deleted: 0,
    updated: 0,
    inserted: 0
  };
  return {
    async begin() {
      await client.query('BEGIN');
    },
    async delete(showId: number, episodenumber: number) {
      stat.deleted++;
      await client.query(`DELETE FROM episodes WHERE episodenumber = $1 and show_id = $2`, [episodenumber, showId]);
    },
    async insert(episode: PgEpisode) {
      stat.inserted++;
      episodesToInsert.push(episode);
      if (episodesToInsert.length >= 50) {
        await client.query(insertEpisodes(episodesToInsert));
        episodesToInsert = [];
      }
    },
    async update(episode: PgEpisode) {
      stat.updated++;
      await client.query(updateEpisode(episode));
    },
    async commit() {
      await client.query(insertEpisodes(episodesToInsert));
      episodesToInsert = [];
      await client.query('COMMIT');
      return stat;
    }
  };
}
