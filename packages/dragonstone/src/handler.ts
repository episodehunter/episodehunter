import { createGuard, Logger } from '@episodehunter/kingsguard';
import { Dragonstone } from '@episodehunter/types/message';
import { ApolloServer } from 'apollo-server-lambda';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { config } from './config';
import { createContext } from './context';
import { resolvers } from './resolvers/root';
import { root as typeDefs } from './types/root';
import { getUidFromHeader, isUsingApiKey } from './util/auth';
import { createFirebase } from './util/firebase-app';
import { assertEpisodeNumber, assertEpisodes, assertShowId, assertShowInput } from './util/validate';

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

exports.updateShowHandler = gard<Dragonstone.UpdateShow.Event>((event, logger): Promise<Dragonstone.UpdateShow.Response> => {
  try {
    assertShowId(event.showId);
    assertShowInput(event.showInput);
  } catch (error) {
    logger.log(`Show was not valid. Event: ${JSON.stringify(event)}`);
    throw new Error(`${error.message} ${JSON.stringify(event)}`);
  }

  return context.firebaseResolver.show.updateShow(event.showId, event.showInput, logger);
});

exports.updateEpisodesHandler = gard<Dragonstone.UpdateEpisodes.Event>((event, logger): Promise<Dragonstone.UpdateEpisodes.Response> => {
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

exports.addShowHandler = gard<Dragonstone.AddShow.Event>((event, logger): Promise<Dragonstone.AddShow.Response> => {
  assertShowInput(event.showInput);
  return context.firebaseResolver.show.addShow(event.showInput, logger);
});

exports.updateTitles = gard((event, logger): Promise<boolean> => {
  logger.log('Start updating titles');
  return context.firebaseResolver.titles.updateTitles();
});
