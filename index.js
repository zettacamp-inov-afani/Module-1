// *************** IMPORT CORE ***************
const GetApolloServer = require('./core/apollo');
const ExpressApp = require('./core/express');
const ConnectDB = require('./core/database');
const { PORT, DB_HOST } = require('./core/config');

/**
 * Initializes and starts the Apollo GraphQL server with Express and MongoDB.
 *
 * @async
 * @function StartServer
 * @returns {Promise<void>}
 */
async function StartServer() {
  try {
    // *************** Connect to MongoDB
    await ConnectDB();

    // *************** Initialize Express app
    const app = ExpressApp();

    // *************** Initialize Apollo Server
    const server = await GetApolloServer();

    // *************** Apply Apollo middleware to Express app
    server.applyMiddleware({ app });

    // *************** Start Express server
    app.listen({ port: PORT }, () =>
      console.log(
        `Server ready at http://${DB_HOST}${PORT}${server.graphqlPath}`
      )
    );
  } catch (error) {
    console.error('Server failed to start:', error.message);
    process.exit(1);
  }
}

// *************** START SERVER
StartServer();
