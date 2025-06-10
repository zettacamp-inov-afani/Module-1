// *************** IMPORT CORE ***************
const { gql } = require("apollo-server-express");

const studentTypeDefs = gql`
  type School {
    _id: ID!
    long_name: String!
    short_name: String!
    address: [Address!]!
    students: [ID!]!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  type Address {
    detail: String!
    city: String!
    country: String!
    zipcode: Int!
  }

  type Student {
    _id: ID!
    first_name: String!
    last_name: String!
    email: String!
    date_of_birth: String
    school_id: School!
    status: String!
    createdAt: String
    updatedAt: String
  }

  input CreateStudentInput {
    first_name: String!
    last_name: String!
    email: String!
    date_of_birth: String
    school_id: ID!
  }

  input UpdateStudentInput {
    id: ID!
    first_name: String!
    last_name: String!
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

// *************** EXPORT MODULE ***************
module.exports = studentTypeDefs;
