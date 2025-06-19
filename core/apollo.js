// *************** IMPORT CORE ***************
const { ApolloServer, gql, ApolloError } = require('apollo-server-express');

// *************** IMPORT DATALOADER ***************
const InitializeLoaders = require('./loader');

// *************** IMPORT MODULE ***************
const typeDefs = require('./typedef');
const resolvers = require('./resolver');

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
