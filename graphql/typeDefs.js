const { gql } = require("apollo-server");

const typeDefs = gql`
  scalar Date

  type User {
    id: ID!
    first_name: String!
    last_name: String!
    email: String!
    role: String!
    deleted_at: Date
  }

  type Student {
    id: ID!
    first_name: String!
    last_name: String!
    email: String!
    date_of_birth: Date
    school_id: ID!
    deleted_at: Date
  }

  type School {
    id: ID!
    name: String!
    address: String
    students: [Student]
    deleted_at: Date
  }

  type Query {
    users: [User]
    students: [Student]
    schools: [School]
  }
`;

module.exports = typeDefs;
