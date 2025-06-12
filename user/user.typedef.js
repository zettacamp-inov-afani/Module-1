// *************** IMPORT CORE ***************
const { gql } = require("apollo-server-express");

// *************** QUERY ***************
const userTypeDefs = gql`
  scalar Date

  enum Civility {
    Mr
    Mrs
  }

  type User {
    id: ID!
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
    id: ID!
    civility: Civility
    first_name: String
    last_name: String
    email: String
    role: String
  }

  type Query {
    GetUser(id: ID!): Student
    GetAllUsers: [User]
    GetOneUser(id: ID!): User
  }

  type Mutation {
    CreateUser(input: CreateUserInput!): User
    UpdateUser(input: UpdateUserInput!): User
    SoftDeleteUser(id: ID!): User
  }
`;

// *************** EXPORT MODULE ***************
module.exports = userTypeDefs;
