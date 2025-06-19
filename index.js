// *************** IMPORT CORE ***************
const { ApolloServer, gql, ApolloError } = require('apollo-server-express');
const express = require('express');

// *************** IMPORT DATALOADER ***************
const InitializeLoaders = require('./core/loader');

// *************** IMPORT MODULE ***************
const typeDefs = require('./core/typedef');
const resolvers = require('./core/resolver');
const ConnectDB = require('./config/db');

/**
 * Initializes and starts the Apollo GraphQL server with Express and MongoDB.
 *
 * @async
 * @function
 * @returns {Promise<void>}
 */
async function StartServer() {
  try {
    // *************** Initialize Express app
    const app = express();

    // *************** Initialize Apollo Server with schema and context
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: () => ({
        // *************** Initialize DataLoader instances for batching and caching
        loaders: InitializeLoaders(),
      }),
    });

    // *************** Apply Apollo middleware to Express app
    server.applyMiddleware({ app });

    // *************** Connect to MongoDB
    await ConnectDB();

    // *************** Start the Express server
    app.listen({ port: `${process.env.PORT}` }, () =>
      console.log(
        `Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`
      )
    );
  } catch (error) {
    throw new ApolloError(
      'School not found or already deleted.',
      'SCHOOL_NOT_FOUND'
    );
  }
}

// *************** START SERVER ***************
StartServer();
