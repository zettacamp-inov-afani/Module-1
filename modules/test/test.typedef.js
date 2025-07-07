// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server-express');

const TestTypeDefs = gql`
  enum EnumTestStatus {
    active
    deleted
  }

  type Test {
    _id: ID!
    name: String!
    description: String!
    weight: Float!
    notations: [Notation!]!
    published_date: Date
    test_status: EnumTestStatus!
    subject_id: Subject!
    created_at: Date!
    updated_at: Date!
    deleted_at: Date!
  }

  type Notation {
    notation_text: String!
    max_points: Float!
  }

  input NotationInput {
    notation_text: String!
    max_points: Float!
  }

  input CreateTestInput {
    subject_id: ID!
    name: String!
    description: String!
    weight: Float!
    notations: [NotationInput!]!
  }

  input UpdateTestInput {
    subject_id: ID!
    name: String!
    description: String!
    weight: Float!
    notations: [NotationInput!]!
  }

  type Query {
    GetOneTest(_iid: ID!): Test
    GetAllTests: [Test!]!
  }

  type Mutation {
    CreateTest(input: CreateTestInput!): Test!
    UpdateTest(_id: ID!, input: UpdateTestInput!): Test!
    DeleteTest(_id: ID!): ID!
  }
`;

// *************** EXPORT MODULE ***************
module.exports = TestTypeDefs;
