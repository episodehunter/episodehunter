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
import { assertShowInput, assertShowId } from './util/validate';

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
        const realResult = result || { headers: {} as { [key: string]: string } };
        realResult.headers = realResult.headers || {};
        realResult.headers['Server-Timing'] = 'dragonstone;desc="Execution time";dur=' + (Date.now() - t0);
        realResult.headers['Access-Control-Allow-Origin'] = '*';
        resolve(realResult);
      }
    });
  });
});

exports.updateShowHandler = gard<{ showId: string; showInput: ShowInput }>((event, logger) => {
  assertShowId(event.showId);
  assertShowInput(event.showInput);
  return context.firebaseResolver.show.updateShow(event.showId, event.showInput, logger);
});

exports.addShowHandler = gard<{ showInput: ShowInput }>((event, logger) => {
  assertShowInput(event.showInput);
  return context.firebaseResolver.show.addShow(event.showInput, logger);
});
