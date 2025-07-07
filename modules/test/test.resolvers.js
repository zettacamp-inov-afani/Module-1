// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const TesttModel = require('./test.model');

// *************** IMPORT VALIDATOR ***************
const ValidateTestInput = require('./test.validator');
const CommonValidator = require('../../utilities/validator');

// *************** QUERY ***************

/**
 * Retrieves a single active Test by its ID.
 *
 * @param {Object} _ - Unused root parameter (standard in GraphQL resolvers).
 * @param {string} _id - The ID of the Test to retrieve.
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
 * @returns {Promise<Array<Object>>} A list of Test objects with status 'active'.
 * @throws {ApolloError} If an error occurs during the database query.
 */
async function GetAllTests() {
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

/**
 * Creates a new Test and updates the corresponding Subject with the new Test's ID.
 *
 * @param {Object} _ - Unused root parameter (standard in GraphQL resolvers).
 * @param {Object} input - Input data for creating the Test.
 * @param {string} input.name - The name of the Test.
 * @param {string} input.description - A description of the Test.
 * @param {number} input.weight - The weight of the Test.
 * @param {Array<Object>} input.notation - An array of notation objects related to the Test.
 * @param {string} input.subject_id - The ID of the related Subject.
 * @returns {Promise<Object>} The created Test document.
 * @throws {ApolloError} If validation fails or database operations fail.
 */
async function CreateTest(_, { input }) {
  try {
    // *************** Validate required input
    ValidateTestInput(input);

    // *************** Create a new Test instance
    const createTest = await TesttModel.create({
      name: input.name,
      description: input.description,
      weight: input.weight,
      notation: input.notation,
      subject_id: input.subject_id,
    });

    // *************** Add the new test's ID to the corresponding Subject `tests` array
    await SubjectModel.updateOne(
      { subject_id: input.subject_id },
      { $addToSet: { test_ids: createSubject._id } }
    );

    return createTest;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetOneTest,
    GetAllTests,
  },
  Mutation: {
    CreateTest,
  },
};
