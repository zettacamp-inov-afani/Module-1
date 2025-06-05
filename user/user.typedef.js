// *************** IMPORT CORE ***************
const { gql } = require("apollo-server-express");

// *************** QUERY ***************
const UserTypeDefs = gql`
  scalar Date

  type User {
    id: ID!
    first_name: String!
    last_name: String!
    email: String!
    role: String!
    deleted_at: Date
  }

  input CreateUserInput {
    first_name: String!
    last_name: String!
    email: String!
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
    GetAllUsers: [User]
    GetOneUser(id: ID!): User
  }

  type Mutation {
    CreateUser(input: CreateUserInput!): User
    UpdateUser(input: UpdateUserInput!): User
    DeleteUser(id: ID!): User
  }
`;

module.exports = UserTypeDefs;
