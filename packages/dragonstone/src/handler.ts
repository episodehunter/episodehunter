import { createGuard, Logger } from '@episodehunter/kingsguard';
import { ApolloServer } from 'apollo-server-lambda';
import { resolvers } from './resolvers/root';
import { root as typeDefs } from './types/root';
import { createContext } from './context';
import { createFirebase } from './util/firebase-app';
import { getUidFromHeader } from './util/auth';
import { config } from './config';
import { APIGatewayProxyEvent } from 'aws-lambda';

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
    context.uid = await getUidFromHeader(firebaseApp.auth, res.event.headers);
    return context;
  }
});

const handler = server.createHandler();
const gard = createGuard(config.ravenDns, config.logdnaKey);

exports.graphqlHandler = gard<APIGatewayProxyEvent & { logger: Logger }>((event, logger, context) => {
  event.logger = logger;
  return new Promise((resolve, reject) => {
    handler(event, context, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
});
