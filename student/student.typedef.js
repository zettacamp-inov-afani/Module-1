// *************** IMPORT CORE ***************
const { gql } = require("apollo-server-express");

// *************** QUERY ***************
const typeDefs = gql`
  scalar Date

  type Student {
    id: ID!
    first_name: String!
    last_name: String!
    email: String!
    date_of_birth: Date
    school_id: ID!
    deleted_at: Date
  }

  input CreateStudentInput {
    first_name: String!
    last_name: String!
    email: String!
    date_of_birth: Date
    school_id: ID!
  }

  input UpdateStudentInput {
    first_name: String
    last_name: String
    email: String
    date_of_birth: Date
    school_id: ID
  }

  type Query {
    GetAllStudents: [Student]
    GetOneStudent(id: ID!): Student
  }

  type Mutation {
    CreateStudent(input: CreateStudentInput!): Student
    UpdateStudent(id: ID!, input: UpdateStudentInput!): Student
    DeleteStudent(id: ID!): Student
  }
`;

module.exports = typeDefs;
