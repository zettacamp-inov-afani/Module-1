// *************** IMPORT CORE ***************
const { gql } = require('apollo-server-express');

const schoolTypeDefs = gql`
  type Address {
    detail: String!
    city: String!
    country: String!
    zipcode: Int!
  }

  type School {
    _id: ID!
    long_name: String!
    short_name: String!
    addresses: [Address!]!
    students: [Student!]!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  input AddressInput {
    detail: String!
    city: String!
    country: String!
    zipcode: Int!
  }

  input SchoolNameInput {
    long_name: String!
    short_name: String!
  }

  input CreateSchoolInput {
    name: SchoolNameInput!
    addresses: [AddressInput!]!
  }

  input UpdateSchoolInput {
    _id: ID!
    name: SchoolNameInput!
    addresses: [AddressInput!]!
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
