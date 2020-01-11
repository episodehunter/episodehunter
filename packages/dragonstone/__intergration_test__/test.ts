import { StartedTestContainer } from 'testcontainers/dist/test-container';
import { GenericContainer } from 'testcontainers';
import { Message } from '@episodehunter/types';
import { Client } from 'pg';
import { setupDatabas } from './setup-db';
import { EpisodeRecord, UserRecord } from '../src/data-sources/pg/schema';

interface GraphQLResult {
  statusCode: 200;
  body: string;
  headers: { [key: string]: string };
}

describe('Intergration test', () => {
  let pg: StartedTestContainer | undefined;
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
    memoryLimitInMB: '100',
    awsRequestId: '1',
    done: () => null,
    fail: () => null,
    succeed: () => null
  });

  const createGraphQlEvent = (query: string, token = '') => {
    return {
      httpMethod: 'POST',
      body: JSON.stringify({
        query
      }),
      path: 'http://localhost:8080',
      requestContext: {
        path: '/'
      },
      headers: token
        ? {
            Authorization: `B ${token}`
          }
        : {}
    };
  };

  beforeAll(async done => {
    // When debuging, start a local docker container with "docker run -p 54320:5432 -e POSTGRES_PASSWORD=test -e POSTGRES_USER=test postgres"
    // and uncomment the following line:
    // process.env.PG_DANGEROUS_TEST_CONNECTION_URI = `postgres://test:test@localhost:54320/test`;
    if (!process.env.PG_DANGEROUS_TEST_CONNECTION_URI) {
      const pgContainer = new GenericContainer('postgres')
        .withEnv('POSTGRES_USER', 'test')
        .withEnv('POSTGRES_PASSWORD', 'test')
        .withExposedPorts(5432);
      pg = await pgContainer.start();
      process.env.PG_CONNECTION_URI = `postgres://test:test@localhost:${pg.getMappedPort(5432)}/test`;
    } else {
      process.env.PG_CONNECTION_URI = process.env.PG_DANGEROUS_TEST_CONNECTION_URI;
    }
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
      if (pg) {
        await pg.stop();
      }
      done();
    } catch (error) {
      done(error);
    }
  });

  beforeEach(() => setupDatabas(client));

  describe('Add show', () => {
    test('Do not add an existing show', async () => {
      // Arrange
      const event: Message.Dragonstone.AddShowEvent = {
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
          time: '03:00',
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
        lastupdatedCheck: 1999999999,
        name: 'Stranger Things',
        network: 'Netflix',
        overview:
          'When a young boy disappears, his mother, a police chief, and his friends must confront terrifying forces in order to get him back.',
        runtime: 50
      });
    });
    test('Add a new, ended, show: Dexter', async () => {
      // Arrange
      const event: Message.Dragonstone.AddShowEvent = {
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
          lastupdate: 1554064896,
          lastupdateCheck: 1554064897
        },
        requestStack: []
      };
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
        lastupdated: 1554064896,
        lastupdated_check: 1554064897,
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
        lastupdatedCheck: 1554064897,
        name: 'Dexter',
        network: 'Showtime',
        overview: 'Dexter Morgan is a Miami-based blood splatter expert',
        runtime: 50
      });
    });
  });

  describe('Update episodes', () => {
    test(`Update episode 'Cancer Man'`, async () => {
      // Arrange
      const event: Message.Dragonstone.UpdateEpisodesEvent = {
        showId: 2,
        firstEpisode: 10002,
        lastEpisode: 10004,
        episodes: [
          {
            episodenumber: 10002,
            firstAired: '2008-02-16',
            lastupdated: 1520652296,
            name: '10002',
            overview: '',
            tvdbId: 2
          },
          {
            episodenumber: 10003,
            firstAired: '2008-02-16',
            lastupdated: 1520652300,
            name: '10003',
            overview: '',
            tvdbId: 3
          },
          {
            episodenumber: 10004,
            firstAired: '2008-02-18',
            lastupdated: 1520652305, // later than db
            name: 'Cancer Man!',
            overview: 'Updated text',
            tvdbId: 7121403
          }
        ],
        requestStack: []
      };
      const oldEpisodes = await client.query(`SELECT * FROM episodes`);

      // Act
      const result = await handler.updateEpisodesHandler(event, createContext());

      // Assert
      const newEpisodes = await client.query(`SELECT * FROM episodes`);
      const findEpisode = (r: EpisodeRecord) => r.episodenumber === 10004 && r.show_id === 2;
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

    test(`Insert a new episodes`, async () => {
      // Arrange
      const event: Message.Dragonstone.UpdateEpisodesEvent = {
        showId: 2,
        firstEpisode: 10006,
        lastEpisode: 10010,
        episodes: [
          {
            episodenumber: 10006,
            firstAired: '2008-02-16',
            lastupdated: 1520652311,
            name: '10006',
            overview: '',
            tvdbId: 6
          },
          {
            episodenumber: 10007,
            firstAired: '2008-02-18',
            lastupdated: 1520652316,
            name: 'Cancer Man!',
            overview: 'Updated text',
            tvdbId: 7
          },
          {
            episodenumber: 10008,
            firstAired: '2008-02-19',
            lastupdated: 1520652316,
            name: 'New episode',
            tvdbId: 8
          },
          {
            episodenumber: 10009,
            firstAired: '2008-02-20',
            lastupdated: 1520652317,
            name: 'New episode2',
            overview: 'Some text2',
            tvdbId: 9
          },
          {
            episodenumber: 10010,
            firstAired: '2008-02-21',
            lastupdated: 1520652318,
            name: 'New episode3',
            tvdbId: 10
          }
        ],
        requestStack: []
      };
      const oldEpisodes = await client.query(`SELECT * FROM episodes`);

      // Act
      const result = await handler.updateEpisodesHandler(event, createContext());

      // Assert
      const newEpisodes = await client.query(`SELECT * FROM episodes`);
      const isNewEpisode = (e: EpisodeRecord) => e.show_id === 2 && [10008, 10009, 10010].includes(e.episodenumber);
      expect(result).toBe(true); // It should go all well
      expect(newEpisodes.rowCount).toBe(oldEpisodes.rowCount + 3);
      expect(newEpisodes.rows.filter(r => !isNewEpisode(r))).toEqual(oldEpisodes.rows);
      expect(newEpisodes.rows.filter(r => isNewEpisode(r))).toEqual([
        {
          show_id: 2,
          name: 'New episode',
          first_aired: '2008-02-19',
          lastupdated: 1520652316,
          episodenumber: 10008,
          external_id_tvdb: 8,
          overview: null
        },
        {
          show_id: 2,
          name: 'New episode2',
          first_aired: '2008-02-20',
          overview: 'Some text2',
          lastupdated: 1520652317,
          external_id_tvdb: 9,
          episodenumber: 10009
        },
        {
          show_id: 2,
          episodenumber: 10010,
          first_aired: '2008-02-21',
          lastupdated: 1520652318,
          name: 'New episode3',
          external_id_tvdb: 10,
          overview: null
        }
      ]);
    });

    test(`Remove an episode`, async () => {
      // Arrange
      const event: Message.Dragonstone.UpdateEpisodesEvent = {
        showId: 2,
        firstEpisode: 10006,
        lastEpisode: 10007,
        episodes: [
          {
            episodenumber: 10006,
            firstAired: '2008-02-16',
            lastupdated: 1520652311,
            name: '10006',
            overview: '',
            tvdbId: 6
          }
        ],
        requestStack: []
      };
      const oldEpisodes = await client.query(`SELECT * FROM episodes`);

      // Act
      const result = await handler.updateEpisodesHandler(event, createContext());

      // Assert
      const newEpisodes = await client.query(`SELECT * FROM episodes`);
      expect(result).toBe(true); // It should go all well
      expect(newEpisodes.rowCount).toBe(oldEpisodes.rowCount - 1);
      expect(newEpisodes.rows).toEqual(oldEpisodes.rows.filter(r => !(r.episodenumber === 10007 && r.show_id === 2)));
    });
  });

  describe('Update Show', () => {
    test(`Update 'Breaking Bad'`, async () => {
      // Arrange
      const event: Message.Dragonstone.UpdateShowEvent = {
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
          lastupdate: 1554064871,
          lastupdateCheck: 1554064872
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
          time: '03:15',
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
        lastupdatedCheck: 1554064872,
        name: 'Breaking Bad!',
        network: 'Showtime',
        overview: 'Walter White!',
        runtime: 51
      });
    });
    test(`Update a show that dont exist`, async () => {
      // Arrange
      const event: Message.Dragonstone.UpdateShowEvent = {
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
    });
  });

  describe('[GraphQL] Show', () => {
    test('Get a show', async () => {
      // Arrange
      await client.query(`INSERT INTO "public"."following" ("user_id", "show_id") VALUES ('2', '2')`);
      const event = createGraphQlEvent(`{
        show(id: 2) {
          name
          airs {
            first
            time
            day
          }
          ended
          genre
          ids {
            id
            imdb
            tvdb
          }
          language
          lastupdated
          network
          overview
          runtime
          seasons
          followers
        }
      }`);

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({
        data: {
          show: {
            name: 'Breaking Bad',
            airs: {
              first: '2008-01-20',
              time: '21:00',
              day: 6
            },
            ended: true,
            genre: ['Crime', 'Drama', 'Suspense', 'Thriller'],
            ids: {
              id: 2,
              imdb: 'tt0903747',
              tvdb: 81189
            },
            language: 'en',
            lastupdated: 1553807287,
            network: 'AMC',
            overview: `Walter White, a struggling high school chemistry teacher, is diagnosed with advanced lung cancer. He turns to a life of crime, producing and selling methamphetamine accompanied by a former student, Jesse Pinkman, with the aim of securing his family's financial future before he dies.`,
            runtime: 45,
            seasons: [1],
            followers: 1
          }
        }
      });
    });
    test('Get upcoming episode for braking bad', async () => {
      // Arrange
      const justAirdDate = new Date();
      justAirdDate.setTime(justAirdDate.getTime() - 24 * 2 * 60 * 60 * 1000);
      const justAirdDateStr = `${justAirdDate.getFullYear()}-${String(justAirdDate.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(justAirdDate.getDate()).padStart(2, '0')}`;
      const nextAirdDate = new Date();
      nextAirdDate.setTime(nextAirdDate.getTime() + 24 * 2 * 60 * 60 * 1000);
      const nextAirdDateStr = `${nextAirdDate.getFullYear()}-${String(nextAirdDate.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(nextAirdDate.getDate()).padStart(2, '0')}`;

      await client.query(`INSERT INTO "public"."episodes" ("show_id", "name", "first_aired", "overview", "lastupdated", "episodenumber", "external_id_tvdb") VALUES
        ('2', 'Fun episode', '${justAirdDateStr}', 'Some overview', '1520652290', '10008', '7121402'),
        ('2', 'What?', '${nextAirdDateStr}', 'Walt and Jesse attempt to tie up loose ends.', '1520652296', '10009', '7121402')
      `);
      const event = createGraphQlEvent(`{
        show(id: 2) {
          name
          upcomingEpisode {
            name
          }
          justAirdEpisode {
            name
          }
          numberOfAiredEpisodes
        }
      }`);

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(JSON.parse(result.body)).toEqual({
        data: {
          show: {
            name: 'Breaking Bad',
            upcomingEpisode: {
              name: 'What?'
            },
            justAirdEpisode: {
              name: 'Fun episode'
            },
            numberOfAiredEpisodes: 8
          }
        }
      });
      expect(result.statusCode).toBe(200);
    });
    test('Get next episode to watch for user', async () => {
      // Arrange
      await client.query(`INSERT INTO "public"."tv_watched" ("user_id", "show_id", "time", "type", "episodenumber") VALUES
      ('2', '2', '1000000000', '2', '10001'),
      ('2', '2', '1000000000', '2', '10003')
      `);

      const event = createGraphQlEvent(
        `{
        show(id: 2) {
          nextToWatch {
            numberOfEpisodesToWatch
            episode {
              name
            }
          }
        }
      }`,
        '2'
      );

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(JSON.parse(result.body)).toEqual({
        data: {
          show: {
            nextToWatch: {
              numberOfEpisodesToWatch: 5,
              episode: {
                name: 'Cancer Man'
              }
            }
          }
        }
      });
      expect(result.statusCode).toBe(200);
    });
    test('User is following Breaking bad', async () => {
      // Arrange
      await client.query(`INSERT INTO "public"."following" ("user_id", "show_id") VALUES ('2', '2')`);

      const event = createGraphQlEvent(
        `{
        show(id: 2) {
          isFollowing
        }
      }`,
        '2'
      );

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(JSON.parse(result.body)).toEqual({
        data: {
          show: {
            isFollowing: true
          }
        }
      });
      expect(result.statusCode).toBe(200);
    });
    test('User is not following Breaking bad', async () => {
      // Arrange
      const event = createGraphQlEvent(
        `{
        show(id: 2) {
          isFollowing
        }
      }`,
        '2'
      );

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(JSON.parse(result.body)).toEqual({
        data: {
          show: {
            isFollowing: false
          }
        }
      });
      expect(result.statusCode).toBe(200);
    });
  });
  describe('[GraphQL] Find show', () => {
    test('Get null if we cant find the show', async () => {
      // Arrange
      const event = createGraphQlEvent(`{
        findShow(theTvDbId: 81190) {
          name
        }
      }`);

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({
        data: {
          findShow: null
        }
      });
    });
    test('Find Breaking Bad', async () => {
      // Arrange
      const event = createGraphQlEvent(`{
        findShow(theTvDbId: 81189) {
          name
        }
      }`);

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({
        data: {
          findShow: {
            name: 'Breaking Bad'
          }
        }
      });
    });
  });
  describe('[GraphQL] Season', () => {
    test('Get season 2 for Stranger Things', async () => {
      // Arrange
      const event = createGraphQlEvent(`{
        season(showId: 1, season: 2) {
          name
        }
      }`);

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({
        data: {
          season: [
            {
              name: 'Chapter One: MADMAX'
            },
            {
              name: 'Chapter Two: Trick or Treat, Freak'
            },
            {
              name: 'Chapter Three: The Pollywog'
            },
            {
              name: 'Chapter Four: Will the Wise'
            },
            {
              name: 'Chapter Five: Dig Dug'
            },
            {
              name: 'Chapter Six: The Spy'
            },
            {
              name: 'Chapter Seven: The Lost Sister'
            },
            {
              name: 'Chapter Eight: The Mind Flayer'
            },
            {
              name: 'Chapter Nine: The Gate'
            }
          ]
        }
      });
    });
  });
  describe('[GraphQL] Following', () => {
    test('Get list of following', async () => {
      // Arrange
      await client.query(`INSERT INTO "public"."following" ("user_id", "show_id") VALUES ('2', '2')`);
      const event = createGraphQlEvent(
        `{
        following {
          showId
          show {
            name
          }
        }
      }`,
        '2'
      );

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({
        data: {
          following: [
            {
              showId: 2,
              show: {
                name: 'Breaking Bad'
              }
            }
          ]
        }
      });
    });
    test('[regression bug] Get list of upcoming episodes for folloing shows', async () => {
      // Arrange
      const justAirdDate = new Date();
      justAirdDate.setTime(justAirdDate.getTime() - 24 * 2 * 60 * 60 * 1000);
      const justAirdDateStr = `${justAirdDate.getFullYear()}-${String(justAirdDate.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(justAirdDate.getDate()).padStart(2, '0')}`;
      const nextAirdDate = new Date();
      nextAirdDate.setTime(nextAirdDate.getTime() + 24 * 2 * 60 * 60 * 1000);
      const nextAirdDateStr = `${nextAirdDate.getFullYear()}-${String(nextAirdDate.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(nextAirdDate.getDate()).padStart(2, '0')}`;

      await client.query(`INSERT INTO "public"."episodes" ("show_id", "name", "first_aired", "overview", "lastupdated", "episodenumber", "external_id_tvdb") VALUES
        ('2', 'Fun episode', '${justAirdDateStr}', 'Some overview', '1520652290', '10008', '7121402'),
        ('2', 'What?', '${nextAirdDateStr}', 'Walt and Jesse attempt to tie up loose ends.', '1520652296', '10009', '7121402'),
        ('1', 'Yoo', '${nextAirdDateStr}', 'Something is happening', '1520652296', '30009', '7121402')
      `);
      await client.query(`INSERT INTO "public"."following" ("user_id", "show_id") VALUES ('2', '2'), ('2', '1')`);
      const event = createGraphQlEvent(
        `{
        following {
          showId
          show {
            name
            upcomingEpisode {
              name
            }
          }
        }
      }`,
        '2'
      );

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({
        data: {
          following: [
            {
              showId: 2,
              show: {
                name: 'Breaking Bad',
                upcomingEpisode: {
                  name: 'What?'
                }
              }
            },
            {
              show: {
                name: 'Stranger Things',
                upcomingEpisode: {
                  name: 'Yoo'
                }
              },
              showId: 1
            }
          ]
        }
      });
    });
  });
  describe('[GraphQL] titles', () => {
    test('Get list of titles', async () => {
      // Arrange
      await client.query(`INSERT INTO "public"."following" ("user_id", "show_id") VALUES ('2', '2')`);
      const event = createGraphQlEvent(`{
        titles {
          id
          name
          followers
          tvdbId
          lastupdated
        }
      }`);

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({
        data: {
          titles: [
            {
              id: 1,
              name: 'Stranger Things',
              followers: 0,
              tvdbId: 305288,
              lastupdated: 1555393924
            },
            {
              id: 2,
              name: 'Breaking Bad',
              followers: 1,
              tvdbId: 81189,
              lastupdated: 1553807287
            }
          ]
        }
      });
    });

    test('Get list of the oldest updated shows', async () => {
      // Arrange
      const event = createGraphQlEvent(`{
        oldestUpdatedShows(limit: 20) {
          id
          name
          lastupdated
          lastupdatedCheck
        }
      }`);

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({
        data: {
          oldestUpdatedShows: [
            {
              id: 2,
              name: 'Breaking Bad',
              lastupdated: 1553807287,
              lastupdatedCheck: 1553807287,
            },
            {
              id: 1,
              name: 'Stranger Things',
              lastupdated: 1555393924,
              lastupdatedCheck: 1999999999,
            }
          ]
        }
      });
    });

    test('Get the oldest updated show', async () => {
      // Arrange
      const event = createGraphQlEvent(`{
        oldestUpdatedShows(limit: 1) {
          id
          name
          lastupdated
          lastupdatedCheck
        }
      }`);

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({
        data: {
          oldestUpdatedShows: [
            {
              id: 2,
              name: 'Breaking Bad',
              lastupdated: 1553807287,
              lastupdatedCheck: 1553807287,
            }
          ]
        }
      });
    });
  });
  describe('[GraphQL] History', () => {
    test('Get first page of history', async () => {
      // Arrange
      await client.query(`INSERT INTO "public"."tv_watched" ("user_id", "show_id", "time", "type", "episodenumber") VALUES
        ('2', '2', '1000000000', '2', '10001'),
        ('2', '2', '1000000001', '2', '10002'),
        ('2', '2', '1000000002', '2', '10003'),
        ('2', '1', '1000000003', '2', '10001')`);
      const event = createGraphQlEvent(
        `{
        history(page: 0) {
          watchedEpisode {
            time
          }
          show {
            name
          }
          episode {
            episodenumber
          }
        }
      }`,
        '2'
      );

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({
        data: {
          history: [
            {
              watchedEpisode: {
                time: 1000000003
              },
              show: {
                name: 'Stranger Things'
              },
              episode: {
                episodenumber: 10001
              }
            },
            {
              watchedEpisode: {
                time: 1000000002
              },
              show: {
                name: 'Breaking Bad'
              },
              episode: {
                episodenumber: 10003
              }
            },
            {
              watchedEpisode: {
                time: 1000000001
              },
              show: {
                name: 'Breaking Bad'
              },
              episode: {
                episodenumber: 10002
              }
            },
            {
              watchedEpisode: {
                time: 1000000000
              },
              show: {
                name: 'Breaking Bad'
              },
              episode: {
                episodenumber: 10001
              }
            }
          ]
        }
      });
    });
    test('Get history of one episode', async () => {
      // Arrange
      await client.query(`INSERT INTO "public"."tv_watched" ("user_id", "show_id", "time", "type", "episodenumber") VALUES
        ('2', '2', '1000000000', '2', '10001'),
        ('2', '2', '1000000001', '2', '10002'),
        ('2', '2', '1000000002', '2', '10003'),
        ('2', '2', '1000000004', '2', '10003'),
        ('2', '1', '1000000003', '2', '10001')`);
      const event = createGraphQlEvent(
        `{
        season(showId: 2, season: 1) {
          episodenumber
          watched {
            time
          }
        }
      }`,
        '2'
      );

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({
        data: {
          season: [
            {
              episodenumber: 10001,
              watched: [
                {
                  time: 1000000000
                }
              ]
            },
            {
              episodenumber: 10002,
              watched: [
                {
                  time: 1000000001
                }
              ]
            },
            {
              episodenumber: 10003,
              watched: [
                {
                  time: 1000000002
                },
                {
                  time: 1000000004
                }
              ]
            },
            {
              episodenumber: 10004,
              watched: []
            },
            {
              episodenumber: 10005,
              watched: []
            },
            {
              episodenumber: 10006,
              watched: []
            },
            {
              episodenumber: 10007,
              watched: []
            }
          ]
        }
      });
    });
  });
  describe('[GraphQL] User', () => {
    test('Get api key of a user', async () => {
      // Arrange
      const event = createGraphQlEvent(
        `{
        me {
          apikey
          username
        }
      }`,
        '2'
      );

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({
        data: {
          me: {
            username: 'tjoskar2',
            apikey: 'hello'
          }
        }
      });
    });
  });
  describe('[GraphQL] Mutation', () => {
    test('Check in episode with token', async () => {
      // Arrange
      const event = createGraphQlEvent(
        `mutation {
        checkInEpisode(episode: {
          showId: 2
          episodenumber: 10001
          time: 1000000000
          type: checkIn
        }) {
          episode {
            episodenumber
          }
        }
      }`,
        '2'
      );

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(JSON.parse(result.body)).toEqual({
        data: {
          checkInEpisode: {
            episode: {
              episodenumber: 10002
            }
          }
        }
      });
      expect(result.statusCode).toBe(200);
      const dbResult = await client.query(`SELECT * FROM tv_watched`);
      expect(dbResult.rows).toEqual([
        {
          id: 1,
          user_id: 2,
          show_id: 2,
          time: 1000000000,
          type: 2,
          episodenumber: 10001
        }
      ]);
    });
    test('Check in episode with api key', async () => {
      // Arrange
      const event = createGraphQlEvent(
        `mutation {
        checkInEpisode(episode: {
          showId: 2
          episodenumber: 10001
          time: 1000000000
          type: checkIn
        }, apiKey: "hello", username: "tjoskar2") {
          madeMutation
        }
      }`
      );

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(JSON.parse(result.body)).toEqual({
        data: {
          checkInEpisode: {
            madeMutation: true
          }
        }
      });
      expect(result.statusCode).toBe(200);
      const dbResult = await client.query(`SELECT * FROM tv_watched`);
      expect(dbResult.rows).toEqual([
        {
          id: 1,
          user_id: 2,
          show_id: 2,
          time: 1000000000,
          type: 2,
          episodenumber: 10001
        }
      ]);
    });
    test('Check in episode with case insensitive api key', async () => {
      // Arrange
      const event = createGraphQlEvent(
        `mutation {
        checkInEpisode(episode: {
          showId: 2
          episodenumber: 10001
          time: 1000000000
          type: checkIn
        }, apiKey: "hEllO", username: "tJoskAr2") {
          madeMutation
        }
      }`
      );

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(JSON.parse(result.body)).toEqual({
        data: {
          checkInEpisode: {
            madeMutation: true
          }
        }
      });
      expect(result.statusCode).toBe(200);
      const dbResult = await client.query(`SELECT * FROM tv_watched`);
      expect(dbResult.rows).toEqual([
        {
          id: 1,
          user_id: 2,
          show_id: 2,
          time: 1000000000,
          type: 2,
          episodenumber: 10001
        }
      ]);
    });
    test('Check in episodes', async () => {
      // Arrange
      const event = createGraphQlEvent(
        `mutation {
        checkInEpisodes(episodes: [{
          showId: 2
          episodenumber: 10001
          time: 1000000000
          type: checkIn
        }, {
          showId: 2
          episodenumber: 10002
          time: 1000000001
          type: checkIn
        }]) {
          episode {
            episodenumber
          }
        }
      }`,
        '2'
      );

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(JSON.parse(result.body)).toEqual({
        data: {
          checkInEpisodes: {
            episode: {
              episodenumber: 10003
            }
          }
        }
      });
      expect(result.statusCode).toBe(200);
      const dbResult = await client.query(`SELECT * FROM tv_watched`);
      expect(dbResult.rows).toEqual([
        {
          id: 1,
          user_id: 2,
          show_id: 2,
          time: 1000000000,
          type: 2,
          episodenumber: 10001
        },
        {
          id: 2,
          user_id: 2,
          show_id: 2,
          time: 1000000001,
          type: 2,
          episodenumber: 10002
        }
      ]);
    });
    test('Remove check in', async () => {
      // Arrange
      await client.query(`
      INSERT INTO "public"."tv_watched" ("user_id", "show_id", "time", "type", "episodenumber") VALUES
      ('2', '2', '1000000000', '2', '10001'),
      ('2', '2', '1000000001', '2', '10002'),
      ('2', '2', '1000000002', '2', '10003'),
      ('2', '2', '1000000003', '2', '10003'),
      ('3', '2', '1000000003', '2', '10003')
      `);
      const event = createGraphQlEvent(
        `mutation {
        removeCheckedInEpisode(episode: {
          showId: 2
          episodenumber: 10003
        }) {
          episode {
            episodenumber
          }
        }
      }`,
        '2'
      );

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(JSON.parse(result.body)).toEqual({
        data: {
          removeCheckedInEpisode: {
            episode: {
              episodenumber: 10003 // Next exposode to watch
            }
          }
        }
      });
      expect(result.statusCode).toBe(200);
      const dbResult = await client.query(`SELECT * FROM tv_watched`);
      expect(dbResult.rows).toEqual([
        {
          id: 1,
          user_id: 2,
          show_id: 2,
          time: 1000000000,
          type: 2,
          episodenumber: 10001
        },
        {
          id: 2,
          user_id: 2,
          show_id: 2,
          time: 1000000001,
          type: 2,
          episodenumber: 10002
        },
        {
          id: 5,
          user_id: 3,
          show_id: 2,
          time: 1000000003,
          type: 2,
          episodenumber: 10003
        }
      ]);
    });
    test('Follow show', async () => {
      // Arrange
      const followingDbResult = await client.query(`SELECT * FROM "following"`);
      expect(followingDbResult.rowCount).toBe(0);
      const event = createGraphQlEvent(
        `mutation {
        followShow(showId: 2)
      }`,
        '2'
      );

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(JSON.parse(result.body)).toEqual({
        data: {
          followShow: true
        }
      });
      expect(result.statusCode).toBe(200);
      const dbResult = await client.query(`SELECT * FROM "following"`);
      expect(dbResult.rows).toEqual([
        {
          id: 1,
          user_id: 2,
          show_id: 2
        }
      ]);
    });
    test('Follow show that somebody else is following', async () => {
      // Arrange
      await client.query(`INSERT INTO "public"."following" ("user_id", "show_id") VALUES ('3', '2')`);
      const event = createGraphQlEvent(
        `mutation {
        followShow(showId: 2)
      }`,
        '2'
      );

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(JSON.parse(result.body)).toEqual({
        data: {
          followShow: true
        }
      });
      expect(result.statusCode).toBe(200);
      const dbResult = await client.query(`SELECT * FROM "following"`);
      expect(dbResult.rows).toEqual([
        {
          id: 1,
          user_id: 3,
          show_id: 2
        },
        {
          id: 2,
          user_id: 2,
          show_id: 2
        }
      ]);
    });
    test('Try to follow show that dont exist', async () => {
      // Arrange
      const followingDbResult = await client.query(`SELECT * FROM "following"`);
      expect(followingDbResult.rowCount).toBe(0);
      const event = createGraphQlEvent(
        `mutation {
        followShow(showId: 200)
      }`,
        '2'
      );

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(JSON.parse(result.body)).toEqual({
        data: {
          followShow: false
        }
      });
      expect(result.statusCode).toBe(200);
      const dbResult = await client.query(`SELECT * FROM "following"`);
      expect(dbResult.rowCount).toEqual(0);
    });
    test('Follow show that we allready follow', async () => {
      // Arrange
      await client.query(`INSERT INTO "public"."following" ("user_id", "show_id") VALUES ('2', '2')`);
      const followingDbResult = await client.query(`SELECT * FROM "following"`);
      expect(followingDbResult.rowCount).toBe(1);
      const event = createGraphQlEvent(
        `mutation {
        followShow(showId: 200)
      }`,
        '2'
      );

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(JSON.parse(result.body)).toEqual({
        data: {
          followShow: false
        }
      });
      expect(result.statusCode).toBe(200);
      const dbResult = await client.query(`SELECT * FROM "following"`);
      expect(dbResult.rows).toEqual([
        {
          id: 1,
          user_id: 2,
          show_id: 2
        }
      ]);
    });
    test('Unfollow show', async () => {
      // Arrange
      await client.query(`INSERT INTO "public"."following" ("user_id", "show_id") VALUES ('2', '2'), ('3', '2')`);
      const followingDbResult = await client.query(`SELECT * FROM "following"`);
      expect(followingDbResult.rowCount).toBe(2);
      const event = createGraphQlEvent(
        `mutation {
        unfollowShow(showId: 2)
      }`,
        '2'
      );

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(JSON.parse(result.body)).toEqual({
        data: {
          unfollowShow: true
        }
      });
      expect(result.statusCode).toBe(200);
      const dbResult = await client.query(`SELECT * FROM "following"`);
      expect(dbResult.rows).toEqual([
        {
          id: 2,
          user_id: 3,
          show_id: 2
        }
      ]);
    });
    test('Try to unfollow a show that we dont follow', async () => {
      // Arrange
      const followingDbResult = await client.query(`SELECT * FROM "following"`);
      expect(followingDbResult.rowCount).toBe(0);
      const event = createGraphQlEvent(
        `mutation {
        followShow(showId: 200)
      }`,
        '2'
      );

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(JSON.parse(result.body)).toEqual({
        data: {
          followShow: false
        }
      });
      expect(result.statusCode).toBe(200);
      const dbResult = await client.query(`SELECT * FROM "following"`);
      expect(dbResult.rowCount).toEqual(0);
    });
    test('Create a user row in the database', async () => {
      // Arrange
      const event = createGraphQlEvent(
        `mutation {
        createUser(metadata: { username: "myusername" })
      }`,
        '123456789' // firebase id
      );

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(JSON.parse(result.body)).toEqual({
        data: {
          createUser: true
        }
      });
      expect(result.statusCode).toBe(200);
      const dbResult = await client.query(`SELECT * FROM "users"`);
      expect(dbResult.rowCount).toBe(3);
      const newRow = dbResult.rows.filter(r => r.name === 'myusername');
      expect(newRow.length).toBe(1);
      expect(newRow[0].firebase_id).toBe('123456789');
      expect(typeof newRow[0].api_key).toBe('string');
      expect(newRow[0].api_key.length).toBe(5);
    });
    test('Do not create a dublet if the user exists', async () => {
      // Arrange
      const dbResultBefore = await client.query(`SELECT * FROM "users"`);
      const event = createGraphQlEvent(
        `mutation {
        createUser(metadata: { username: "tjoskar2" })
      }`,
        '2'
      );

      // Act
      const result: GraphQLResult = (await handler.graphqlHandler(event as any, createContext())) as any;

      // Assert
      expect(JSON.parse(result.body)).toEqual({
        data: {
          createUser: true
        }
      });
      expect(result.statusCode).toBe(200);
      const dbResultAfter = await client.query(`SELECT * FROM "users"`);
      const sort = (a: UserRecord, b: UserRecord) => a.id - b.id;
      expect(dbResultAfter.rows.sort(sort)).toEqual(dbResultBefore.rows.sort(sort));
    });
  });
});
