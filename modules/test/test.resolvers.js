// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const TesttModel = require('./test.model');

// *************** IMPORT VALIDATORS ***************
const ValidateTestInput = require('./test.validator');
const CommonValidator = require('../../utilities/validator');

// *************** QUERY ***************

/**
 * Retrieves a single active Test by its ID.
 *
 * @param {Object} _ - Unused root parameter (standard in GraphQL resolvers).
 * @param {Object} args - The arguments passed to the resolver.
 * @param {string} args._id - The ID of the Test to retrieve.
 * @returns {Promise<Object>} The Test object if found and active.
 * @throws {ApolloError} If the ID is invalid, the Test is not found, or another error occurs.
 */
async function GetOneTest(_, { _id }) {
  try {
    // *************** Validate Subject ID
    CommonValidator.ValidateObjectId(_id, 'Test ID');

    // *************** Find test by ID and check if status is active
    const test = await TesttModel.findOne({
      _id: _id,
      status: 'active',
    }).lean();

    // *************** Handle case if Test not found or already deleted
    if (!subject) {
      throw new ApolloError(
        'Test not found or already deleted.',
        'TEST_NOT_FOUND'
      );
    }

    return test;
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
