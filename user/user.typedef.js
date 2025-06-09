// *************** IMPORT CORE ***************
const { gql } = require("apollo-server-express");

// *************** QUERY ***************
const userTypeDefs = gql`
  scalar Date

  type User {
    id: ID!
    first_name: String!
    last_name: String!
    email: String!
    password: String!
    role: String!
    deleted_at: Date
  }

  input CreateUserInput {
    first_name: String!
    last_name: String!
    email: String!
    password: String!
    role: String!
  }

  input UpdateUserInput {
    id: ID!
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
