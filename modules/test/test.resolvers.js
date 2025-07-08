// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const TestModel = require('./test.model');
const TaskModel = require('../task/task.model');
const SubjectModel = require('../subject/subject.model');
const UserModel = require('../user/user.model');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateTestInput,
  ValidatePublishTestInput,
} = require('./test.validator');
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
    const test = await TestModel.findOne({
      _id: _id,
      test_status: 'active',
    }).lean();

    // *************** Handle case if Test not found or already deleted
    if (!test) {
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
    const tests = await TestModel.find({
      test_status: 'active',
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
    const createTest = await TestModel.create({
      name: input.name,
      description: input.description,
      weight: input.weight,
      notations: input.notations,
      subject_id: input.subject_id,
    });

    // *************** Add the new test's ID to the corresponding Subject `tests` array
    await SubjectModel.updateOne(
      { _id: input.subject_id },
      { $addToSet: { test_ids: createTest._id } }
    );

    return createTest;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * Updates an existing active Test document by its ID.
 *
 * @param {Object} _ - Unused root parameter (standard in GraphQL resolvers).
 * @param {string} _id - The ID of the Test to update.
 * @param {Object} input - The new data to update the Test with.
 * @param {string} input.name - The updated name of the Test.
 * @param {string} input.description - The updated description of the Test.
 * @param {number} input.weight - The updated weight of the Test.
 * @param {Array<Object>} input.notations - The updated array of notations.
 * @param {string} input.subject_id - The updated subject ID linked to the Test.
 * @returns {Promise<Object>} The updated Test document.
 * @throws {ApolloError} If the ID is invalid, the Test is not found, or a database error occurs.
 */
async function UpdateTest(_, { _id, input }) {
  try {
    // *************** Validate test ID (must be valid MongoDB ObjectId)
    CommonValidator.ValidateObjectId(_id, 'Test ID');

    // *************** Validate test input
    ValidateTestInput(input);

    const updateFields = {
      name: input.name,
      description: input.description,
      weight: input.weight,
      notations: input.notations,
      subject_id: input.subject_id,
    };

    // *************** Update the test data if active
    const updatedTest = await TestModel.findOneAndUpdate(
      { _id: _id, test_status: 'active' },
      { $set: updateFields },
      { new: true }
    ).lean();

    // *************** Handle case if Test not found or already deleted
    if (!updatedTest) {
      throw new ApolloError(
        'Test not found or already deleted.',
        'TEST_NOT_FOUND'
      );
    }

    // *************** Return the updated data
    return updatedTest;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * Publishes a test by updating its published date and creating a task to assign a corrector.
 *
 * This function performs the following steps:
 * 1. Validates the test ID.
 * 2. Validates the input payload (e.g., user ID and optional due date).
 * 3. Updates the test's `published_date` if it is currently active.
 * 4. Creates an `assign_corrector` task linked to the test.
 * 5. Returns the ID of the published test.
 *
 * Throws an ApolloError if any of the validation steps fail,
 * if the test is not found or cannot be updated,
 * or if the task creation fails.
 *
 * @returns {Object} An object containing the `id` of the published test.
 * @throws {ApolloError} If validation fails or the update/task creation fails.
 */
async function PublishTest(_, { _id, input }) {
  try {
    // *************** Validate test ID (must be valid MongoDB ObjectId)
    CommonValidator.ValidateObjectId(_id, 'Test ID');

    // *************** Validate User ID
    ValidatePublishTestInput(input);

    // *************** Update the Test document with published_date
    const publishTest = await TestModel.updateOne(
      { _id: _id, test_status: 'active' },
      { $set: { published_date: new Date() } }
    );

    // *************** Handle case when update did not affect any document
    if (!publishTest || publishTest.modifiedCount === 0) {
      throw new ApolloError('Failed to publish test', 'UPDATE_FAILED');
    }

    // *************** Create a Task to assign the corrector for the test
    await TaskModel.create({
      test_id: _id,
      user_id: input.user_id,
      task_type: 'assign_corrector',
      task_status: 'in_progress',
      due_date: input.due_date,
    });

    return { _id: _id };
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * Soft deletes a test and removes its reference from the related subject.
 *
 * Marks the test as deleted by updating its status and deleted timestamp,
 * then removes the test ID from the subject's test list.
 *
 * @returns {string} The ID of the deleted test.
 * @throws {ApolloError} If validation fails or the test is not found.
 */
async function DeleteTest(_, { _id }) {
  try {
    // *************** Validate the test id
    CommonValidator.ValidateObjectId(_id, 'Test ID');

    // *************** Find the Test with the given ID and "active" status, then update it to "deleted"
    const deletedTest = await TestModel.findOneAndUpdate(
      { _id, test_status: 'active' },
      { $set: { test_status: 'deleted', deleted_at: new Date() } }
    );

    // *************** Handle case if Test not found or already deleted
    if (!deletedTest) {
      throw new ApolloError(
        'Test not found or already deleted.',
        'TEST_NOT_FOUND'
      );
    }

    // *************** Delete test from relate subject
    await SubjectModel.updateOne(
      { _id: deletedTest.subject_id },
      { $pull: { test_ids: _id } }
    );

    // *************** Return the _id
    return _id;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

// *************** LOADER ***************

async function subject_id(parent, args, { loaders }) {
  // *************** sanity check to ensure parent.block_id is an array with elements before attempting to use DataLoader
  CommonValidator.ValidateObjectId(parent.subject_id);

  const loadedSubject = await loaders.SubjectLoader.load(
    String(parent.subject_id)
  );

  return loadedSubject;
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetOneTest,
    GetAllTests,
  },
  Mutation: {
    CreateTest,
    UpdateTest,
    PublishTest,
    DeleteTest,
  },
  Test: {
    subject_id: subject_id,
  },
};
