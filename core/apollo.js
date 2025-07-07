// *************** IMPORT LIBRARY ***************
const { ApolloServer, ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const TypeDefs = require('./typedef');
const Resolvers = require('./resolver');

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
      typeDefs: TypeDefs,
      resolvers: Resolvers,
      context: () => ({
        // *************** Initialize DataLoader instances for batching
        loaders: InitializeLoaders(),
      }),
    });
  } catch (error) {
    throw new ApolloError(error.message, 'SERVER_FAIL');
  }
}

// *************** EXPORT MODULE ***************
module.exports = CreateApolloServer;
