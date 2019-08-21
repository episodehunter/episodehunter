import { StartedTestContainer } from 'testcontainers/dist/test-container';
import { GenericContainer } from 'testcontainers';
import { Client } from 'pg';
import { setupSchema } from './setup-db';

const pgContainer = new GenericContainer('postgres')
  .withEnv('POSTGRES_USER', 'test')
  .withEnv('POSTGRES_PASSWORD', 'test')
  .withExposedPorts(5432);

describe('Intergration test', () => {
  let pg: StartedTestContainer;
  let client: Client;

  beforeAll(async () => {
    pg = await pgContainer.start();
    process.env.PG_CONNECTION_URI = `postgres://test:test@localhost:${pg.getMappedPort(5432)}/test`;
    process.env.FIREBASE_KEY = `This is a Firebase key`;
    process.env.ENGINE_API_KEY = `This is a ENGINE_API_KEY`;
    process.env.LOGDNA_KEY = `This is a LOGDNA_KEY`;
    process.env.AWS_SENTRY_DSN = `This is a AWS_SENTRY_DSN`;

    client = new Client({ connectionString: process.env.PG_CONNECTION_URI });
    client.connect();

    await setupSchema(client);
  });

  afterAll(async () => {
    await client.end();
    await pg.stop();
  });

  test('User must be created', async () => {
    await client.query(
      `INSERT INTO users (firebase_id, name, api_key) VALUES ('some key', 'some name', 'some api key')`
    );

    const result = await client.query(`SELECT * FROM users`);

    expect(result.rowCount).toBe(1);
    expect(result.rows[0]).toEqual({
      id: 1,
      firebase_id: 'some key',
      name: 'some name',
      api_key: 'some api key'
    });
  });
});
