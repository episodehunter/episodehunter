import { ApolloServer } from 'apollo-server';
import { resolvers } from './resolvers/root';
import { root as typeDefs } from './types/root';
import { createContext } from './context';

const context = createContext()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => context
})

server.listen({ port: 3000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
