import { StartedTestContainer } from 'testcontainers/dist/test-container';
import { GenericContainer } from 'testcontainers';
import { Dragonstone } from '@episodehunter/types/message';
import { Client } from 'pg';
import { setupSchema } from './setup-db';

const pgContainer = new GenericContainer('postgres')
  .withEnv('POSTGRES_USER', 'test')
  .withEnv('POSTGRES_PASSWORD', 'test')
  .withExposedPorts(5432);

describe('Intergration test', () => {
  let pg: StartedTestContainer;
  let client: Client;
  let handler: typeof import('../src/handler');

  const createContext = () => ({
    functionName: 'function-under-test',
    getRemainingTimeInMillis: () => 5000,
    functionVersion: '1',
    requestId: 2,
    logGroupName: 'log-group-name',
    logStreamName: 'log-stream-name',
    callbackWaitsForEmptyEventLoop: false,
    invokedFunctionArn: '',
    memoryLimitInMB: 100,
    awsRequestId: '1',
    done: () => null,
    fail: () => null,
    succeed: () => null
  });

  beforeAll(async done => {
    pg = await pgContainer.start();
    process.env.PG_CONNECTION_URI = `postgres://test:test@localhost:${pg.getMappedPort(5432)}/test`;
    // Start a local docker container with "docker run -p 54320:5432 -e POSTGRES_PASSWORD=test -e POSTGRES_USER=test postgres"
    // and uncomment the following line:
    // process.env.PG_CONNECTION_URI = `postgres://test:test@localhost:54320/test`;
    process.env.FIREBASE_KEY = ``;
    process.env.ENGINE_API_KEY = ``;
    process.env.LOGDNA_KEY = ``;
    process.env.AWS_SENTRY_DSN = ``;
    process.env.NODE_ENV = 'test';

    try {
      client = new Client({ connectionString: process.env.PG_CONNECTION_URI });
      client.connect();

      await setupSchema(client);
      handler = await import('../src/handler');
      done();
    } catch (error) {
      done(error);
    }
  });

  afterAll(async done => {
    const sutClient = (global as any).__DANGEROUS_CLIENT;
    try {
      await client.end();
      if (sutClient) {
        await sutClient.end();
      }
      await pg.stop();
      done();
    } catch (error) {
      done(error);
    }
  });

  describe('Add show', () => {
    test('Add a new, ended, show: Dexter', async () => {
      // Arrange
      const event: Dragonstone.AddShow.Event = {
        showInput: {
          tvdbId: 79349,
          imdbId: 'tt0773262',
          name: 'Dexter',
          firstAired: '2006-10-01',
          genre: ['Crime', 'Drama', 'Mystery', 'Suspense', 'Thriller'],
          language: 'en',
          network: 'Showtime',
          overview: 'Dexter Morgan is a Miami-based blood splatter expert',
          runtime: 50,
          ended: true,
          lastupdate: 1554064896
        },
        requestStack: []
      };
      const getDexterQuery = `SELECT * FROM shows WHERE name='Dexter'`;
      let dbResult = await client.query(getDexterQuery);
      expect(dbResult.rowCount).toBe(0);

      // Act
      const result = await handler.addShowHandler(JSON.stringify(event), createContext());

      // Assert
      dbResult = await client.query(getDexterQuery);

      expect(dbResult.rowCount).toBe(1);
      expect(dbResult.rows[0]).toEqual({
        id: 3,
        name: 'Dexter',
        external_id_imdb: 'tt0773262',
        external_id_tvdb: 79349,
        airs_first: '2006-10-01',
        airs_time: null,
        airs_day: null,
        genre: ['Crime', 'Drama', 'Mystery', 'Suspense', 'Thriller'],
        language: 'en',
        network: 'Showtime',
        overview: 'Dexter Morgan is a Miami-based blood splatter expert',
        runtime: 50,
        ended: true,
        lastupdated: 1554064896
      });
      expect(result).toEqual({
        airs: {
          first: '2006-10-01',
          time: null,
          day: null
        },
        ended: true,
        genre: ['Crime', 'Drama', 'Mystery', 'Suspense', 'Thriller'],
        ids: {
          id: 3,
          imdb: 'tt0773262',
          tvdb: 79349
        },
        language: 'en',
        lastupdated: 1554064896,
        name: 'Dexter',
        network: 'Showtime',
        overview: 'Dexter Morgan is a Miami-based blood splatter expert',
        runtime: 50
      });
    });
  });
});
