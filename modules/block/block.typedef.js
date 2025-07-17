// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server-express');

const BlockTypeDefs = gql`
  enum EnumBlockStatus {
    active
    deleted
  }

  enum EnumConditionType {
    total_mark
    subject_result
  }

  enum EnumConditionOperator {
    GT
    GTE
    LT
    LTE
    EQ
  }

  enum EnumLogicOperator {
    AND
    OR
  }

  enum EnumGoal {
    PASS
    FAIL
  }

  type Rule {
    logical_operator: EnumLogicOperator
    operator: EnumConditionOperator
    type: EnumConditionType
    subject_id: ID
    test_id: ID
    value: Float!
  }

  type BlockCriteria {
    goal: EnumGoal
    rules: [Rule!]
  }

  type Block {
    _id: ID!
    name: String!
    description: String!
    subject_ids: [Subject]
    block_status: EnumBlockStatus!
    criteria: [BlockCriteria]
    created_at: Date!
    updated_at: Date!
    deleted_at: Date
  }

  input RuleInput {
    logical_operator: EnumLogicOperator
    operator: EnumConditionOperator
    type: EnumConditionType
    subject_id: ID
    test_id: ID
    value: Float
  }

  input BlockCriteriaInput {
    goal: EnumGoal
    rules: [RuleInput!]
  }

  input CreateBlockInput {
    name: String!
    description: String!
    subject_ids: [ID!]
    criteria: [BlockCriteriaInput]
  }

  input UpdateBlockInput {
    name: String!
    description: String!
    subject_ids: [ID!]!
    criteria: [BlockCriteriaInput]
  }

  type Query {
    GetOneBlock(_id: ID!): Block
    GetAllBlocks: [Block!]!
  }

  type Mutation {
    CreateBlock(input: CreateBlockInput!): Block!
    UpdateBlock(_id: ID!, input: UpdateBlockInput!): Block!
    DeleteBlock(_id: ID!): ID!
  }
`;

// *************** EXPORT MODULE ***************
module.exports = BlockTypeDefs;
