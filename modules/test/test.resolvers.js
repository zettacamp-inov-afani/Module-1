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
    // *************** Validate Test ID
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

    // *************** Check if the subject is active
    const subject = await SubjectModel.findOne({
      _id: input.subject_id,
      subject_status: 'active',
    }).lean();

    if (!subject) {
      throw new ApolloError(
        'Subject not found or already deleted.',
        'SUBJECT_NOT_FOUND'
      );
    }

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
 * Publishes a Test by setting its `published_date` and creates an "assign_corrector" Task.
 *
 * This function performs the following actions:
 * - Validates the Test ID and input payload.
 * - Updates the Test document to set `published_date` if it is still active.
 * - Creates a new Task to assign the corrector for the test.
 *
 * @param {Object} _ - Unused first resolver argument (parent/root).
 * @param {string} _id - The ID of the Test to be published.
 * @param {Object} input - Input object containing user_id and due_date for the task.
 * @param {string} input.user_id - The ID of the user to assign as corrector.
 * @param {string} input.due_date - The due date for the "assign_corrector" task.
 *
 * @returns {Promise<string>} The ID of the published Test.
 *
 * @throws {ApolloError} If the ID is invalid, the update fails, or task creation fails.
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
      task_status: 'pending',
      due_date: input.due_date,
    });

    return _id;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * Soft deletes a Test by setting its status to `'deleted'` and removing its reference from the related Subject.
 *
 * This function performs the following actions:
 * - Validates the Test ID.
 * - Marks the Test as deleted by updating its `test_status` and `deleted_at`.
 * - Removes the Test ID from the `test_ids` array of the associated Subject.
 *
 * @param {Object} _ - Unused first resolver argument (parent/root).
 * @param {string} _id - The ID of the Test to delete.
 *
 * @returns {Promise<string>} The ID of the deleted Test.
 *
 * @throws {ApolloError} If the Test ID is invalid, not found, already deleted, or if any update fails.
 */
async function DeleteTest(_, { _id }) {
  try {
    // *************** Validate the test id
    CommonValidator.ValidateObjectId(_id, 'Test ID');

    // *************** Find the Test with the given ID and "active" status, then update it to "deleted"
    const deletedTest = await TestModel.updateOne(
      { _id, test_status: 'active' },
      { $set: { test_status: 'deleted', deleted_at: new Date() } }
    );

    // *************** Handle case if Test not found or already deleted
    if (deletedTest.matchedCount === 0) {
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

/**
 * Field resolver to load the Subject associated with a parent object using DataLoader.
 *
 * Validates the `subject_id` from the parent object, then loads the corresponding
 * Subject document using `SubjectLoader`.
 *
 * @param {Object} parent - The parent object containing the `subject_id` field.
 * @param {Object} context - GraphQL context object.
 * @param {Object} context.loaders - Object containing configured DataLoaders.
 * @returns {Promise<Object>} The loaded Subject document.
 *
 * @throws {ApolloError} If the `subject_id` is invalid or if loading fails.
 */
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
