import assert from 'assert';
import { createGuard, Logger } from '@episodehunter/kingsguard';
import { ApolloServer } from 'apollo-server-lambda';
import { resolvers } from './resolvers/root';
import { root as typeDefs } from './types/root';
import { createContext } from './context';
import { createFirebase } from './util/firebase-app';
import { getUidFromHeader, isUsingApiKey } from './util/auth';
import { config } from './config';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { ShowInput } from './types/show';
import { assertShowInput, assertShowId, assertEpisodes, assertEpisodeNumber } from './util/validate';
import { EpisodeInput, EpisodeInputBatch } from './types/episode';
import { PublicTypes } from './public';

const firebaseApp = createFirebase();
const context = createContext(firebaseApp.firestore);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    apiKey: config.engineApiKey
  },
  context: async (res: { event: { headers: { [key: string]: string }; logger: Logger } }) => {
    context.logger = res.event.logger;
    context.usingApiKey = isUsingApiKey(res.event.headers);
    context.uid = await getUidFromHeader(firebaseApp.auth, res.event.headers);
    return context;
  }
});

const apolloHandler = server.createHandler();
const gard = createGuard(config.sentryDns, config.logdnaKey);

exports.graphqlHandler = gard<APIGatewayProxyEvent & { logger: Logger }>((event, logger, context) => {
  event.logger = logger;
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

exports.updateShowHandler = gard<{ showId: string; showInput: ShowInput }>((event, logger) => {
  try {
    assertShowId(event.showId);
    assertShowInput(event.showInput);
  } catch (error) {
    logger.log(`Show was not valid. Event: ${JSON.stringify(event)}`);
    throw new Error(`${error.message} ${JSON.stringify(event)}`);
  }

  return context.firebaseResolver.show.updateShow(event.showId, event.showInput, logger);
});

exports.updateEpisodesHandler = gard<EpisodeInputBatch>((event, logger) => {
  try {
    assertShowId(event.showId)
    assertEpisodeNumber(event.firstEpisode)
    assertEpisodeNumber(event.lastEpisode)
    assertEpisodes(event.episodes)
  } catch (error) {
    logger.log(`Episodes batch was not valid. Event: ${JSON.stringify(event)}`);
    throw new Error(`${error.message} ${JSON.stringify(event)}`);
  }

  return context.firebaseResolver.episode.updateEpisodes(event.showId, event.firstEpisode, event.lastEpisode, event.episodes, logger);
});

exports.addShowHandler = gard<{ showInput: ShowInput }>((event, logger): Promise<PublicTypes.Show> => {
  assertShowInput(event.showInput);
  return context.firebaseResolver.show.addShow(event.showInput, logger);
});
