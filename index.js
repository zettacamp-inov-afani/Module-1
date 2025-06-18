// *************** IMPORT CORE ***************
const { ApolloServer, gql, ApolloError } = require('apollo-server-express');
const express = require('express');
const { mergeTypeDefs } = require('@graphql-tools/merge');
const { mergeResolvers } = require('@graphql-tools/merge');

// *************** IMPORT DATALOADER ***************
const CreateStudentsByIdLoader = require('./student/student.loader');
const CreateSchoolByIdLoader = require('./school/school.loader');

// *************** IMPORT MODULE ***************
const UserTypeDefs = require('./user/user.typedef');
const UserResolvers = require('./user/user.resolvers');

const StudentTypeDefs = require('./student/student.typedef');
const StudentResolvers = require('./student/student.resolvers');

const SchoolTypeDefs = require('./school/school.typedef');
const SchoolResolvers = require('./school/school.resolvers');
const ConnectDB = require('./config/db');

// *************** Merge typedefs and resolvers
const typeDefs = mergeTypeDefs([UserTypeDefs, StudentTypeDefs, SchoolTypeDefs]);
const resolvers = mergeResolvers([
  UserResolvers,
  StudentResolvers,
  SchoolResolvers,
]);

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
        loaders: {
          studentById: CreateStudentsByIdLoader(),
          schoolById: CreateSchoolByIdLoader(),
        },
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
