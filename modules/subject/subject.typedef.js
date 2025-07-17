// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server-express');

const SubjectTypeDefs = gql`
  enum EnumSubjectStatus {
    active
    deleted
  }

  enum EnumSubjectConditionType {
    total_mark
    test_result
  }

  type SubjectRule {
    logical_operator: EnumLogicOperator
    operator: EnumConditionOperator
    test_id: ID
    type: EnumSubjectConditionType
    value: Float
  }

  type SubjectCriteria {
    goal: EnumGoal!
    rules: [SubjectRule!]!
  }

  type Subject {
    _id: ID!
    name: String!
    description: String!
    coefficient: Int!
    criteria: [SubjectCriteria]!
    subject_status: EnumSubjectStatus!
    block_id: Block!
    test_ids: [Test]
    created_at: Date!
    updated_at: Date!
    deleted_at: Date
  }

  input SubjectRuleInput {
    logical_operator: EnumLogicOperator
    operator: EnumConditionOperator
    test_id: ID
    type: EnumSubjectConditionType
    value: Float
  }

  input SubjectCriteriaInput {
    goal: EnumGoal!
    rules: [SubjectRuleInput!]!
  }

  input CreateSubjectInput {
    block_id: ID!
    name: String!
    description: String!
    coefficient: Int!
    criteria: [SubjectCriteriaInput!]!
  }

  input UpdateSubjectInput {
    block_id: ID!
    name: String!
    description: String!
    coefficient: Int!
    criteria: [SubjectCriteriaInput!]!
  }

  type Query {
    GetOneSubject(_id: ID!): Subject
    GetAllSubjects: [Subject!]!
  }

  type Mutation {
    CreateSubject(input: CreateSubjectInput!): Subject!
    UpdateSubject(_id: ID!, input: UpdateSubjectInput!): Subject!
    DeleteSubject(_id: ID!): ID!
  }
`;

// *************** EXPORT MODULE ***************
module.exports = SubjectTypeDefs;
