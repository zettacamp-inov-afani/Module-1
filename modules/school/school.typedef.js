// *************** IMPORT CORE ***************
const { gql } = require('apollo-server-express');

const schoolTypeDefs = gql`
  type Address {
    detail: String!
    city: String!
    country: String!
    zipcode: String!
  }

  type School {
    _id: ID!
    long_name: String!
    short_name: String!
    addresses: [Address!]!
    students: [Student!]!
    status: String!
    created_at: String!
    updated_at: String!
    deleted_at: Date
  }

  input AddressInput {
    detail: String!
    city: String!
    country: String!
    zipcode: String!
  }

  input CreateSchoolInput {
    long_name: String!
    short_name: String!
    addresses: [AddressInput!]!
  }

  input UpdateSchoolInput {
    _id: ID!
    long_name: String!
    short_name: String!
    addresses: [AddressInput]
  }

  type Query {
    GetOneSchool(_id: ID!): School
    GetAllSchools: [School!]!
  }

  type Mutation {
    CreateSchool(input: CreateSchoolInput!): School!
    UpdateSchool(input: UpdateSchoolInput!): School!
    DeleteSchool(_id: ID!): School!
  }
`;

// *************** EXPORT MODULE ***************
module.exports = schoolTypeDefs;
