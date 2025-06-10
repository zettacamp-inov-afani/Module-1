// *************** IMPORT CORE ***************
const { gql } = require("apollo-server-express");

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
    address: [Address!]!
    students: [ID!]!
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
    address: [AddressInput!]!
  }

  input UpdateSchoolInput {
    id: ID!
    name: SchoolNameInput!
    address: [AddressInput!]!
  }

  type Query {
    GetSchool(id: ID!): School
    GetAllSchools: [School!]!
  }

  type Mutation {
    CreateSchool(input: CreateSchoolInput!): School!
    UpdateSchool(input: UpdateSchoolInput!): School!
    SoftDeleteSchool(id: ID!): School!
  }
`;

// *************** EXPORT MODULE ***************
module.exports = schoolTypeDefs;
