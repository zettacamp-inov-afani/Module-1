// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server-express');

const StudentTestResultTypeDefs = gql`
  enum EnumStudentTestResultStatus {
    active
    deleted
  }

  type Mark {
    notation_text: String!
    mark: Float!
  }

  type StudentTestResult {
    _id: ID!
    student_id: Student!
    test_id: Test!
    marks: [Mark!]!
    average_mark: Float!
    mark_entry_date: Date!
    mark_validate_date: Date
    student_test_result_status: EnumStudentTestResultStatus!
    created_at: Date!
    updated_at: Date!
    deleted_at: Date
  }

  input MarkInput {
    notation_text: String!
    mark: Float!
  }

  input EnterMarkInput {
    student_id: ID!
    test_id: ID!
    marks: [MarkInput!]!
    average_mark: Float!
  }

  input UpdateEnterMark {
    student_id: ID!
    test_id: ID!
    marks: [MarkInput!]!
    average_mark: Float!
  }

  type Query {
    GetOneStudentTestResult(_id: ID!): StudentTestResult!
    GetAllStudentTestResults: [StudentTestResult!]!
  }

  type Mutation {
    EnterMarks(input: EnterMarkInput): StudentTestResult!
    UpdateMarks(_id: ID!, input: UpdateEnterMark): StudentTestResult!
    ValidateMarks(_id: ID!): StudentTestResult!
    DeleteStudentTestResult(_id: ID!): ID!
  }
`;

// *************** EXPORT MODULE ***************
module.exports = StudentTestResultTypeDefs;
