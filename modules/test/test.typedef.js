// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server-express');

const TestTypeDefs = gql`
  enum EnumTestStatus {
    active
    deleted
  }

  type TestRule {
    logical_operator: EnumLogicOperator!
    operator: EnumConditionOperator!
    value: Float!
  }

  type TestCriteria {
    goal: EnumGoal!
    rules: [TestRule!]!
  }

  type Test {
    _id: ID!
    name: String!
    description: String!
    weight: Float!
    notations: [Notation!]!
    published_date: Date
    test_status: EnumTestStatus!
    criteria: [TestCriteria]
    subject_id: Subject!
    created_at: Date!
    updated_at: Date!
    deleted_at: Date
  }

  type Notation {
    notation_text: String!
    max_points: Float!
  }

  input NotationInput {
    notation_text: String!
    max_points: Float!
  }

  input TestRuleInput {
    logical_operator: EnumLogicOperator!
    operator: EnumConditionOperator!
    value: Float!
  }

  input TestCriteriaInput {
    goal: EnumGoal!
    rules: [TestRuleInput!]!
  }

  input CreateTestInput {
    subject_id: ID!
    name: String!
    description: String!
    weight: Float!
    notations: [NotationInput!]!
    criteria: [TestCriteriaInput!]!
  }

  input UpdateTestInput {
    subject_id: ID!
    name: String!
    description: String!
    weight: Float!
    notations: [NotationInput!]!
    criteria: [TestCriteriaInput!]!
  }

  input PublishTestInput {
    user_id: ID!
    due_date: Date
  }

  type Query {
    GetOneTest(_id: ID!): Test
    GetAllTests: [Test!]!
  }

  type Mutation {
    CreateTest(input: CreateTestInput!): Test!
    UpdateTest(_id: ID!, input: UpdateTestInput!): Test!
    PublishTest(_id: ID!, input: PublishTestInput!): ID!
    DeleteTest(_id: ID!): ID!
  }
`;

// *************** EXPORT MODULE ***************
module.exports = TestTypeDefs;
