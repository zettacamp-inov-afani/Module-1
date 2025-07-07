// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const TesttModel = require('./test.model');

// *************** IMPORT VALIDATORS ***************
const ValidateTestInput = require('./test.validator');
const CommonValidator = require('../../utilities/validator');

// *************** QUERY ***************

async function GetOneTest(_, { _id }) {
  try {
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetOneTest,
  },
  Mutation: {},
};
