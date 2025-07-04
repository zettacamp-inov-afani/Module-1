// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server-express');

const BlockTypeDefs = gql`
  scalar Date

  enum EnumBlockStatus {
    active
    deleted
  }

  type Block {
    _id: ID!
    name: String!
    description: String!
    subject_ids: [Subject]
    block_status: EnumBlockStatus!
    created_at: Date!
    updated_at: Date!
    deleted_at: Date!
  }

  input CreateBlockInput {
    name: String!
    description: String!
    subject_ids: [ID!]
  }

  input UpdateBlockInput {
    name: String!
    description: String!
    subject_ids: [ID!]!
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
