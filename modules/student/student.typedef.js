// *************** IMPORT CORE ***************
const { gql } = require('apollo-server-express');

const studentTypeDefs = gql`
  enum Civility {
    Mr
    Mrs
  }

  type Student {
    _id: ID!
    civility: Civility!
    first_name: String!
    last_name: String!
    email: String!
    tele_phone: String!
    date_of_birth: Date!
    place_of_birth: String!
    postal_code_of_birth: String!
    school_id: School!
    status: String!
    created_at: String
    updated_at: String
    deleted_at: Date
  }

  input CreateStudentInput {
    civility: Civility!
    first_name: String!
    last_name: String!
    email: String!
    tele_phone: String!
    date_of_birth: Date!
    place_of_birth: String!
    postal_code_of_birth: String!
    school_id: ID!
  }

  input UpdateStudentInput {
    civility: Civility!
    first_name: String!
    last_name: String!
    email: String!
    tele_phone: String!
    date_of_birth: Date!
    place_of_birth: String!
    postal_code_of_birth: String!
    school_id: ID!
  }

  type Query {
    GetOneStudent(_id: ID!): Student
    GetAllStudents: [Student!]!
  }

  type Mutation {
    CreateStudent(input: CreateStudentInput!): Student
    UpdateStudent(_id: ID!, input: UpdateStudentInput!): Student
    DeleteStudent(_id: ID!): Student
  }
`;

// *************** EXPORT MODULE ***************
module.exports = studentTypeDefs;
