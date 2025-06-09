// *************** IMPORT CORE ***************
const { ApolloServer, gql } = require("apollo-server-express");
const express = require("express");
const mongoose = require("mongoose");
const { mergeTypeDefs } = require("@graphql-tools/merge");
const { mergeResolvers } = require("@graphql-tools/merge");

// *************** IMPORT DATALOADER ***************
const createStudentsBySchoolLoader = require("./school/school.loader");
const createSchoolByIdLoader = require("./student/student.loader");

// *************** IMPORT MODULE ***************
const userTypeDefs = require("./user/user.typedef");
const userResolvers = require("./user/user.resolvers");

const studentTypeDefs = require("./student/student.typedef");
const studentResolvers = require("./student/student.resolvers");

const schoolTypeDefs = require("./school/school.typedef");
const schoolResolvers = require("./school/school.resolvers");

// Merge typedef and resolver
const typeDefs = mergeTypeDefs([userTypeDefs, studentTypeDefs, schoolTypeDefs]);
const resolvers = mergeResolvers([
  userResolvers,
  studentResolvers,
  schoolResolvers,
]);

async function startServer() {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({
      loaders: {
        studentsBySchool: createStudentsBySchoolLoader(),
        schoolById: createSchoolByIdLoader(),
      },
    }),
  });

  // How to Server.start() in Apollo Server v2
  server.applyMiddleware({ app });

  await mongoose.connect("mongodb://localhost:27017/zettaschool", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
}

startServer();
