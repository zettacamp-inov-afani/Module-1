// *************** IMPORT CORE ***************
const { gql } = require("apollo-server-express");

// *************** QUERY ***************
const typeDefs = gql`
  scalar Date

  type School {
    id: ID!
    name: String!
    address: String
    students: [Student]
    deleted_at: Date
  }

  input CreateSchoolInput {
    name: String!
    address: String
  }

  input UpdateSchoolInput {
    id: ID!
    name: String
    address: String
  }

  input DeleteSchoolInput {
    id: ID!
  }

  type Query {
    users: [User]
    students: [Student]
    schools: [School]
    GetAllSchools: [School]
    GetOneSchool(id: ID!): School
  }

  type Mutation {
    CreateSchool(input: CreateSchoolInput!): School
    UpdateSchool(input: UpdateSchoolInput!): School
    DeleteSchool(input: DeleteSchoolInput!): School
  }
`;

module.exports = typeDefs;
