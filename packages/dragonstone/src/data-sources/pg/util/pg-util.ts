import { QueryConfig } from 'pg';

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

export function insert(table: string, obj: any): QueryConfig {
  const columnNames = [];
  const columnIndex = [];
  const columnValues = [];
  let i = 1;
  for (let key in obj) {
    columnNames.push(key);
    columnIndex.push(`$${i++}`)
    columnValues.push(obj[key]);
  }
  const text = `INSERT INTO ${table} (${columnNames.join(', ')}) VALUES (${columnIndex.join(', ')}) RETURNING *`;
  return { text, values: columnValues };
}
