// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server-express');

const CalculationResultTypeDefs = gql`
  enum EnumCalculationResult {
    active
    deleted
  }

  enum EnumTranscriptStatus {
    PASS
    FAIL
  }

  type BlockResult {
    block_id: ID!
    block_result: EnumTranscriptStatus
    total_mark: Float!
    subject_results: [SubjectResult!]!
  }

  type SubjectResult {
    subject_id: ID!
    subject_result: EnumTranscriptStatus
    total_mark: Float
    test_results: [TestResult!]!
  }

  type TestResult {
    test_id: ID!
    test_result: EnumTranscriptStatus
    average_mark: Float!
    weighted_mark: Float!
  }

  type CalculationResult {
    _id: ID!
    student_id: ID!
    overall_result: EnumTranscriptStatus
    results: [BlockResult!]!
    created_at: Date!
    updated_at: Date!
    deleted_at: Date!
  }

  type Query {
    GetCalculationResult(student_id: ID!): CalculationResult
  }
`;

// *************** EXPORT MODULE ***************
module.exports = CalculationResultTypeDefs;
