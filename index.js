// *************** IMPORT MODULE ***************
const { PORT } = require('./core/config');

// *************** IMPORT UTILITIES ***************
const CreateApolloServer = require('./core/apollo');
const CreateExpressApp = require('./core/express');
const ConnectMongoDB = require('./core/database');

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
    await ConnectMongoDB();

    // *************** Initialize Express app
    const app = CreateExpressApp();

    // *************** Initialize Apollo Server
    const server = await CreateApolloServer();

    // *************** Apply Apollo middleware to Express app
    server.applyMiddleware({ app });

    // *************** Start Express server
    app.listen({ port: PORT }, () => console.log('Server ready'));
  } catch (error) {
    console.error('Server failed to start:', error.message);
    process.exit(1);
  }
}

// *************** START SERVER
StartServer();
