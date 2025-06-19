// *************** IMPORT CORE ***************
const { ApolloServer, gql, ApolloError } = require('apollo-server-express');

// *************** IMPORT DATALOADER ***************
const InitializeLoaders = require('./loader');

// *************** IMPORT MODULE ***************
const typeDefs = require('./typedef');
const resolvers = require('./resolver');

/**
 * Initializes and returns a configured Apollo Server instance.
 *
 * This function sets up the Apollo Server with GraphQL type definitions,
 * resolvers, and a context that includes DataLoader instances
 * for efficient batching and caching of database requests.
 *
 * @async
 * @function GetApolloServer
 * @returns {Promise<ApolloServer>} A configured Apollo Server instance ready to be applied to an Express app.
 * @throws {ApolloError} If the server fails to initialize.
 */
async function GetApolloServer() {
  try {
    return new ApolloServer({
      typeDefs,
      resolvers,
      context: () => ({
        // *************** Initialize DataLoader instances for batching and caching
        loaders: InitializeLoaders(),
      }),
    });
  } catch (error) {
    throw new ApolloError('Server not starting', 'SERVER_FAIL');
  }
}
// *************** START SERVER ***************
module.exports = GetApolloServer;
