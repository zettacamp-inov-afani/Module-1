// *************** IMPORT CORE ***************
const { gql } = require('apollo-server-express');

// *************** QUERY ***************
const userTypeDefs = gql`
  scalar Date

  enum Civility {
    Mr
    Mrs
  }

  type User {
    _id: ID!
    civility: Civility!
    first_name: String!
    last_name: String!
    email: String!
    password: String!
    role: String!
    status: String!
  }

  input CreateUserInput {
    civility: Civility!
    first_name: String!
    last_name: String!
    email: String!
    password: String!
    role: String!
  }

  input UpdateUserInput {
    _id: ID!
    civility: Civility
    first_name: String
    last_name: String
    email: String
    role: String
  }

  type Query {
    GetAllUsers: [User]
    GetOneUser(_id: ID!): User
  }

  type Mutation {
    CreateUser(input: CreateUserInput!): User
    UpdateUser(input: UpdateUserInput!): User
    DeleteUser(_id: ID!): User
  }
`;

// *************** EXPORT MODULE ***************
module.exports = userTypeDefs;
