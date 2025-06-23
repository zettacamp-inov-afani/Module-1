// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server-express');

const SchoolTypeDefs = gql`
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
    UpdateSchool(_id: ID!, input: UpdateSchoolInput!): School!
    DeleteSchool(_id: ID!): School!
  }
`;

// *************** EXPORT MODULE ***************
module.exports = SchoolTypeDefs;
