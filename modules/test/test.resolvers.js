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

/**
 * Retrieves all active Test documents.
 *
 * @param {Object} _ - Unused root parameter (standard in GraphQL resolvers).
 * @param {Object} args - Arguments passed to the resolver (currently unused).
 * @returns {Promise<Array<Object>>} A list of Test objects with status 'active'.
 * @throws {ApolloError} If an error occurs during the database query.
 */
async function GetAllTests(_, args) {
  try {
    // *************** Retrieve all tests with status 'active'
    const tests = await TesttModel.find({
      status: 'activve',
    }).lean();

    // *************** return the result
    return tests;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

// *************** MUTATION ***************

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetOneTest,
    GetAllTests,
  },
  Mutation: {},
};
