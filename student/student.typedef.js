// *************** IMPORT CORE ***************
const { gql } = require("apollo-server-express");

const studentTypeDefs = gql`
  type Student {
    _id: ID!
    first_name: String!
    last_name: String!
    email: String!
    date_of_birth: String
    school_id: ID!
    status: String!
    createdAt: String
    updatedAt: String
  }

  input StudentNameInput {
    first_name: String!
    last_name: String!
  }

  input CreateStudentInput {
    name: StudentNameInput!
    email: String!
    date_of_birth: String
    school_id: ID!
  }

  input UpdateStudentInput {
    id: ID!
    name: StudentNameInput!
    email: String
    date_of_birth: String
    school_id: ID!
  }

  type Query {
    GetStudent(id: ID!): Student
    GetAllStudents: [Student]
  }

  type Mutation {
    CreateStudent(input: CreateStudentInput!): Student
    UpdateStudent(input: UpdateStudentInput!): Student
    SoftDeleteStudent(id: ID!): Student
  }
`;

module.exports = studentTypeDefs;
