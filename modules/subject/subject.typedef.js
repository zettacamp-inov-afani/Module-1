// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server-express');

const SubjectTypeDefs = gql`
  enum EnumSubjectStatus {
    active
    deleted
  }

  type Subject {
    _id: ID!
    name: String!
    description: String!
    coefficient: Int!
    subject_status: EnumSubjectStatus!
    block_id: Block!
    test_ids: [Test!]
    created_at: Date!
    updated_at: Date!
    deleted_at: Date!
  }

  input CreateSubjectInput {
    block_id: ID!
    name: String!
    description: String!
    coefficient: Int!
  }

  input UpdateSubjectInput {
    block_id: ID!
    name: String!
    description: String!
    coefficient: Int!
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
