import { Client } from 'pg';
import { config } from '../config';

export function createPostgresClient() {
  const client = new Client({ connectionString: config.pgConnectionUri, ssl: true });
  client.connect()
  return client;
}
