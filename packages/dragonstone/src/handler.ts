import { createGuard, Logger } from '@episodehunter/kingsguard';
import { Message } from '@episodehunter/types';
import typeDefs from '@episodehunter/types/dragonstone-aot-schema';
import { ApolloServer } from 'apollo-server-lambda';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { config } from './config';
import { createContext } from './context';
import { resolvers } from './resolvers/root';
import { getFirebaseUidFromHeader } from './util/auth';
import { createFirebase } from './util/firebase-app';
import { assertEpisodeNumber, assertEpisodes, assertShowId, assertShowInput } from './util/validate';
import { createPostgresClient, PgClient, DatabaseError } from './util/pg';
import { createResolver, PgResolver } from './data-sources/pg';

const firebaseApp = createFirebase();
let client: PgClient | undefined;
let pgResolver: PgResolver | undefined;

const getClient = (): PgClient => {
  if (!client) {
    client = createPostgresClient();
    // Expose the client for testing
    if (process.env.NODE_ENV === 'test') {
      (global as any).__DANGEROUS_CLIENT = client;
    }
  }
  return client;
};

const getPgResolver = (): PgResolver => {
  if (!pgResolver) {
    pgResolver = createResolver(getClient());
  }
  return pgResolver;
};

let dangerousLogger: Logger;

const server = new ApolloServer({
  typeDefs,
  resolvers: resolvers as any,
  engine: {
    apiKey: config.engineApiKey,
    reportErrorFunction(err) {
      // Error while reporting error to engine
      if (dangerousLogger) {
        dangerousLogger.captureException(err);
      }
    }
  },
  formatError(err) {
    if (dangerousLogger) {
      if (err.originalError) {
        const errorToLog = {
          name: err.originalError.name,
          message: err.originalError.message,
          path: err.path,
          stack: err.originalError.stack
        };
        dangerousLogger.captureException(errorToLog);
      } else {
        dangerousLogger.captureException(err);
      }
    }

    if (err.originalError instanceof DatabaseError) {
      return {
        message:
          'Sorry but there was an internal server error. We could not handel you request for some reason. We will fix it ASAP',
        locations: err.locations,
        path: err.path,
        extensions: err.extensions
      };
    } else {
      return err;
    }
  },
  context: async (req: { event: { headers: { [key: string]: string }; logger: Logger } }) => {
    const firebaseUid = await getFirebaseUidFromHeader(firebaseApp.auth, req.event.headers);
    const context = await createContext(getPgResolver(), req.event.logger, firebaseUid);
    return context;
  }
});

const apolloHandler = server.createHandler();
const gard = createGuard(config.sentryDns, config.logdnaKey);

export const graphqlHandler = gard<APIGatewayProxyEvent & { logger: Logger }>((event, logger, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  event.logger = logger;
  dangerousLogger = logger;
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    apolloHandler(event, context, (error, result) => {
      if (error) {
        reject(error);
      } else {
        if (!result) {
          return;
        }
        if (result.statusCode > 200) {
          logger.captureException(
            new Error(`Status code is ${result.statusCode}. body: ${JSON.stringify(result.body)}`)
          );
        }
        result.headers = result.headers || {};
        result.headers['Server-Timing'] = 'dragonstone;desc="Execution time";dur=' + (Date.now() - t0);
        result.headers['Access-Control-Allow-Origin'] = '*';
        resolve(result);
      }
    });
  });
});

/**
 * Update an existing show. Will however not update the episodes
 */
export const updateShowHandler = gard<Message.Dragonstone.UpdateShowEvent>(
  (event, logger): Promise<Message.Dragonstone.UpdateShowResponse> => {
    try {
      assertShowId(event.showId);
      assertShowInput(event.showInput);
    } catch (error) {
      logger.log(`Show was not valid. Event: ${JSON.stringify(event)}`);
      throw new Error(`${error.message} ${JSON.stringify(event)}`);
    }

    return getPgResolver().show.updateShow(event.showId, event.showInput, logger);
  }
);

/**
 * Update, add and remove episodes to a existing show.
 * Gives a episode array and a start and a end episode number.
 */
export const updateEpisodesHandler = gard<Message.Dragonstone.UpdateEpisodesEvent>(
  (event, logger): Promise<Message.Dragonstone.UpdateEpisodesResponse> => {
    try {
      assertShowId(event.showId);
      assertEpisodeNumber(event.firstEpisode);
      assertEpisodeNumber(event.lastEpisode);
      assertEpisodes(event.episodes);
    } catch (error) {
      logger.log(`Episodes batch was not valid. Event: ${JSON.stringify(event)}`);
      throw new Error(`${error.message} ${JSON.stringify(event)}`);
    }

    return getPgResolver().episode.updateEpisodes(
      event.showId,
      event.firstEpisode,
      event.lastEpisode,
      event.episodes,
      logger
    );
  }
);

/**
 * Add a new show to the database
 */
export const addShowHandler = gard<Message.Dragonstone.AddShowEvent>(
  (event, logger): Promise<Message.Dragonstone.AddShowResponse> => {
    assertShowInput(event.showInput);
    return getPgResolver().show.addShow(event.showInput, logger);
  }
);
