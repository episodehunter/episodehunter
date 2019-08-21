import { Client } from 'pg';
import { config } from '../config';

export function createPostgresClient() {
  let ssl = true;
  if (process.env.NODE_ENV === 'test') {
    ssl = false;
  }
  const client = new Client({ connectionString: config.pgConnectionUri, ssl });
  client.connect();
  return client;
}
