import { ApolloServer } from 'apollo-server-lambda';
import { resolvers } from './resolvers/root';
import { root as typeDefs } from './types/root';
import { createContext } from './context';

const context = createContext()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => context
});

exports.graphqlHandler = server.createHandler();
