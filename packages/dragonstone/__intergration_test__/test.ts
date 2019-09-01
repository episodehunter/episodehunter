import { StartedTestContainer } from 'testcontainers/dist/test-container';
import { GenericContainer } from 'testcontainers';
import { Dragonstone } from '@episodehunter/types/message';
import { Client } from 'pg';
import { setupDatabas } from './setup-db';
import { PgEpisode } from '../src/data-sources/pg/pg-types';

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
    test('Do not add an existing show', async () => {
      // Arrange
      await setupDatabas(client);
      const event: Dragonstone.AddShow.Event = {
        showInput: {
          tvdbId: 305288, // Stranger Things
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

      expect(dbResult.rowCount).toBe(0);
      expect(result).toEqual({
        airs: {
          first: '2016-07-15',
          time: "03:00",
          day: 4
        },
        ended: false,
        genre: ['Adventure', 'Drama', 'Fantasy', 'Mystery'],
        ids: {
          id: 1,
          imdb: 'tt4574334',
          tvdb: 305288
        },
        language: 'en',
        lastupdated: 1555393924,
        name: 'Stranger Things',
        network: 'Netflix',
        overview: 'When a young boy disappears, his mother, a police chief, and his friends must confront terrifying forces in order to get him back.',
        runtime: 50
      });
    });
    test('Add a new, ended, show: Dexter', async () => {
      // Arrange
      await setupDatabas(client);
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
      await setupDatabas(client);
      const getDexterQuery = `SELECT * FROM shows WHERE name='Dexter'`;

      // Act
      const result = await handler.addShowHandler(JSON.stringify(event), createContext());

      // Assert
      const dbResult = await client.query(getDexterQuery);

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
    })
  });

  describe('Update episodes', () => {
    test(`Update episode 'Cancer Man'`, async () => {
      // Arrange
      await setupDatabas(client);
      const event: Dragonstone.UpdateEpisodes.Event = {
        showId: 2,
        firstEpisode: 10002,
        lastEpisode: 10004,
        episodes: [{
          episodenumber: 10002,
          firstAired: '2008-02-16',
          lastupdated: 1520652296,
          name: '10002',
          overview: '',
          tvdbId: 2
        }, {
          episodenumber: 10003,
          firstAired: '2008-02-16',
          lastupdated: 1520652300,
          name: '10003',
          overview: '',
          tvdbId: 3
        }, {
          episodenumber: 10004,
          firstAired: '2008-02-18',
          lastupdated: 1520652305, // later than db
          name: 'Cancer Man!',
          overview: 'Updated text',
          tvdbId: 7121403
        }],
        requestStack: []
      }
      const oldEpisodes = await client.query(`SELECT * FROM episodes`)

      // Act
      const result = await handler.updateEpisodesHandler(event, createContext())

      // Assert
      const newEpisodes = await client.query(`SELECT * FROM episodes`)
      const findEpisode = (r: PgEpisode) => r.episodenumber === 10004 && r.show_id === 2;
      expect(result).toBe(true); // It should go all well
      expect(newEpisodes.rowCount).toBe(oldEpisodes.rowCount); // We should not remove nor add any new episodes
      expect(newEpisodes.rows.filter(r => !findEpisode(r))).toEqual(oldEpisodes.rows.filter(r => !findEpisode(r)));
      expect(newEpisodes.rows.find(findEpisode)).toEqual({
        show_id: 2,
        name: 'Cancer Man!',
        first_aired: '2008-02-18',
        overview: 'Updated text',
        lastupdated: 1520652305,
        episodenumber: 10004,
        external_id_tvdb: 7121403
      });
    });

    test(`Insert a new episode 'New episode'`, async () => {
      // Arrange
      await setupDatabas(client);
      const event: Dragonstone.UpdateEpisodes.Event = {
        showId: 2,
        firstEpisode: 10006,
        lastEpisode: 10008,
        episodes: [{
          episodenumber: 10006,
          firstAired: '2008-02-16',
          lastupdated: 1520652311,
          name: '10006',
          overview: '',
          tvdbId: 6
        }, {
          episodenumber: 10007,
          firstAired: '2008-02-18',
          lastupdated: 1520652316,
          name: 'Cancer Man!',
          overview: 'Updated text',
          tvdbId: 7
        }, {
          episodenumber: 10008,
          firstAired: '2008-02-19',
          lastupdated: 1520652316,
          name: 'New episode',
          overview: 'Some text',
          tvdbId: 8
        }],
        requestStack: []
      }
      const oldEpisodes = await client.query(`SELECT * FROM episodes`)

      // Act
      const result = await handler.updateEpisodesHandler(event, createContext())

      // Assert
      const newEpisodes = await client.query(`SELECT * FROM episodes`)
      expect(result).toBe(true); // It should go all well
      expect(newEpisodes.rowCount).toBe(oldEpisodes.rowCount + 1);
      expect(newEpisodes.rows.filter(r => !(r.episodenumber === 10008 && r.show_id === 2))).toEqual(oldEpisodes.rows);
      expect(newEpisodes.rows.find(r => r.episodenumber === 10008 && r.show_id === 2)).toEqual({
        show_id: 2,
        name: 'New episode',
        first_aired: '2008-02-19',
        overview: 'Some text',
        lastupdated: 1520652316,
        episodenumber: 10008,
        external_id_tvdb: 8
      });
    });

    test(`Remove an episode`, async () => {
      // Arrange
      await setupDatabas(client);
      const event: Dragonstone.UpdateEpisodes.Event = {
        showId: 2,
        firstEpisode: 10006,
        lastEpisode: 10007,
        episodes: [{
          episodenumber: 10006,
          firstAired: '2008-02-16',
          lastupdated: 1520652311,
          name: '10006',
          overview: '',
          tvdbId: 6
        }],
        requestStack: []
      }
      const oldEpisodes = await client.query(`SELECT * FROM episodes`)

      // Act
      const result = await handler.updateEpisodesHandler(event, createContext())

      // Assert
      const newEpisodes = await client.query(`SELECT * FROM episodes`)
      expect(result).toBe(true); // It should go all well
      expect(newEpisodes.rowCount).toBe(oldEpisodes.rowCount - 1);
      expect(newEpisodes.rows).toEqual(oldEpisodes.rows.filter(r => !(r.episodenumber === 10007 && r.show_id === 2)));
    });
  });

  describe('Update Show', () => {
    test(`Update 'Breaking Bad'`, async () => {
      // Arrange
      await setupDatabas(client);
      const event: Dragonstone.UpdateShow.Event = {
        showId: 2,
        showInput: {
          tvdbId: 81180,
          imdbId: 'tt0903748',
          name: 'Breaking Bad!',
          firstAired: '2008-01-21',
          airsDayOfWeek: 1,
          airsTime: '03:15',
          genre: ['Crime', 'Drama', 'Mystery', 'Suspense', 'Thriller'],
          language: 'en',
          network: 'Showtime',
          overview: 'Walter White!',
          runtime: 51,
          ended: false,
          lastupdate: 1554064871
        },
        requestStack: []
      };

      // Act
      const result = await handler.updateShowHandler(JSON.stringify(event), createContext());

      // Assert
      const dbResult = await client.query(`SELECT * FROM shows WHERE id=2`);

      expect(dbResult.rowCount).toBe(1);
      expect(result).toEqual({
        airs: {
          first: '2008-01-21',
          time: "03:15",
          day: 1
        },
        ended: false,
        genre: ['Crime', 'Drama', 'Mystery', 'Suspense', 'Thriller'],
        ids: {
          id: 2,
          imdb: 'tt0903748',
          tvdb: 81180
        },
        language: 'en',
        lastupdated: 1554064871,
        name: 'Breaking Bad!',
        network: 'Showtime',
        overview: 'Walter White!',
        runtime: 51
      });
    });
    test(`Update a show that dont exist`, async () => {
      // Arrange
      await setupDatabas(client);
      const event: Dragonstone.UpdateShow.Event = {
        showId: 21,
        showInput: {
          tvdbId: 81180,
          imdbId: 'tt0903748',
          name: 'Breaking Bad!',
          firstAired: '2008-01-21',
          airsDayOfWeek: 1,
          airsTime: '03:15',
          genre: ['Crime', 'Drama', 'Mystery', 'Suspense', 'Thriller'],
          language: 'en',
          network: 'Showtime',
          overview: 'Walter White!',
          runtime: 51,
          ended: false,
          lastupdate: 1554064871
        },
        requestStack: []
      };

      // Act
      const result = await handler.updateShowHandler(JSON.stringify(event), createContext());

      // Assert
      const dbResult = await client.query(`SELECT * FROM shows WHERE id=21`);

      expect(dbResult.rowCount).toBe(0);
      expect(result).toBe(null);
    })
  });
});
