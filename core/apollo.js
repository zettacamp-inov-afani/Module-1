// *************** IMPORT LIBRARY ***************
const { ApolloServer, gql, ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const typeDefs = require('./typedef');
const resolvers = require('./resolver');

// *************** IMPORT UTILITIES ***************
const InitializeLoaders = require('./loader');

/**
 * Initializes and returns a configured Apollo Server instance.
 *
 * This function sets up the Apollo Server with GraphQL type definitions,
 * resolvers, and a context that includes DataLoader instances
 * for efficient batching and caching of database requests.
 *
 * @async
 * @function CreateApolloServer
 * @returns {Promise<ApolloServer>} A configured Apollo Server instance ready to be applied to an Express app.
 * @throws {ApolloError} If the server fails to initialize.
 */
async function CreateApolloServer() {
  try {
    return new ApolloServer({
      typeDefs,
      resolvers,
      context: () => ({
        // *************** Initialize DataLoader instances for batching
        loaders: InitializeLoaders(),
      }),
    });
  } catch (error) {
    throw new ApolloError('Server not starting', 'SERVER_FAIL');
  }
}

// *************** EXPORT MODULE ***************
module.exports = CreateApolloServer;
