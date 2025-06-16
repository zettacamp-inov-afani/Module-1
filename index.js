// *************** IMPORT CORE ***************
const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const mongoose = require('mongoose');
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
  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
}

// *************** START SERVER ***************
StartServer();
