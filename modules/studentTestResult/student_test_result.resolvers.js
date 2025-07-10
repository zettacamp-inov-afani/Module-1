// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const StudentTestResultModel = require('./student_test_result.model');
const TaskModel = require('../task/task.model');

// *************** IMPORT VALIDATOR ***************
const ValidateStudentTestResultInput = require('./student_test_result.validator');
const CommonValidator = require('../../utilities/validator');

// *************** QUERY ***************

/**
 * Get a single active StudentTestResult by ID.
 *
 * @param {Object} _ - Unused first resolver argument (parent/root).
 * @param {string} _id - The ID of the StudentTestResult to retrieve.
 * @returns {Promise<Object>} The StudentTestResult document if found and active.
 *
 * @throws {ApolloError} If the ID is invalid or the StudentTestResult is not found or already deleted.
 */
async function GetOneStudentTestResult(_, { _id }) {
  try {
    // *************** Validate StudentTestResult ID
    CommonValidator.ValidateObjectId(_id, 'StudentTestResult ID');

    const studentTestResult = await StudentTestResultModel.findOne({
      _id: _id,
      student_test_result_status: 'active',
    }).lean();

    // *************** Handle case if StudentTestResult not found or already deleted
    if (!studentTestResult) {
      throw new ApolloError(
        'Student Test Result not found or already deleted.',
        'STUDENT_TEST_RESULT_NOT_FOUND'
      );
    }

    return studentTestResult;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * Get all active StudentTestResult documents.
 *
 * This function:
 * - Queries the database for all StudentTestResults with `student_test_result_status: 'active'`.
 * - Returns an array of matching documents.
 *
 * @returns {Promise<Object[]>} An array of active StudentTestResult documents.
 * @throws {ApolloError} If a database error occurs.
 */
async function GetAllStudentTestResults() {
  try {
    // *************** Retrieve all Student Test Results with status 'active'
    const studentTestResults = await StudentTestResultModel.find({
      student_test_result_status: 'active',
    }).lean();

    // *************** return the result
    return studentTestResults;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

// *************** MUTATION ***************

/**
 * Enter student marks for a test, update the corresponding task to "Completed",
 * and create a new "Validate Marks" task for further evaluation.
 * @param {Object} _ - Unused parent argument from GraphQL resolver
 * @param {Object} input - Input payload for entering marks
 * @param {string} input.student_id - The ID of the student
 * @param {string} input.test_id - The ID of the test
 * @param {Array<{notation_text: string, mark: number}>} input.marks - Array of mark entries
 * @param {number} input.average_mark - Average mark calculated from the provided marks
 * @param {string} input.user_id - The ID of the user assigned to validate marks
 *
 * @returns {Promise<Object>} The created `StudentTestResult` document
 * @throws {ApolloError} If validation fails or any DB operation encounters an error
 */
async function EnterMarks(_, { input }) {
  try {
    // *************** Validate required input
    ValidateStudentTestResultInput(input);

    // *************** Calculate average_mark
    let total = 0;
    let averageMark = 0;

    if (Array.isArray(input.marks) && input.marks.length) {
      for (const markEntry of input.marks) {
        total += markEntry.mark;
      }
      averageMark = total / input.marks.length;
    }

    // *************** Create a new StudentTestResult instance
    const createEnterMarks = await StudentTestResultModel.create({
      student_id: input.student_id,
      test_id: input.test_id,
      marks: input.marks,
      average_mark: averageMark,
      mark_entry_date: new Date(),
    });

    // *************** Update "Enter Marks" task to Completed
    const updateTask = await TaskModel.findOneAndUpdate(
      {
        test_id: input.test_id,
        task_type: 'enter_marks',
        task_status: 'pending',
      },
      {
        $set: {
          task_status: 'completed',
          updated_at: new Date(),
        },
      }
    );

    // *************** Create a new "Validate Marks" task
    await TaskModel.create({
      test_id: input.test_id,
      user_id: updateTask.user_id,
      task_type: 'validate_marks',
      task_status: 'pending',
    });

    return createEnterMarks;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * Validate a StudentTestResult by setting the mark_validate_date and completing the related task.
 *
 * @param {Object} _ - Unused first resolver argument (parent/root).
 * @param {string} _id - The ID of the StudentTestResult to validate.
 * @returns {Promise<Object>} The updated StudentTestResult document.
 *
 * @throws {ApolloError} If the ID is invalid or the StudentTestResult is not found or already deleted.
 */
async function ValidateMarks(_, { _id }) {
  try {
    // *************** Validate StudentTestResult ID (must be valid MongoDB ObjectId)
    CommonValidator.ValidateObjectId(_id, 'StudentTestResult ID');

    // *************** Update validate date
    const validateMarks = await StudentTestResultModel.findOneAndUpdate(
      {
        _id,
        student_test_result_status: 'active',
      },
      {
        $set: {
          mark_validate_date: new Date(),
        },
      },
      { new: true }
    ).lean();

    // *************** Handle not found
    if (!validateMarks) {
      throw new ApolloError(
        'Student Test Result not found or already deleted.',
        'STUDENT_TEST_RESULT_NOT_FOUND'
      );
    }

    // *************** Update related "Validate Marks" task to completed
    await TaskModel.findOneAndUpdate(
      {
        test_id: validateMarks.test_id,
        task_type: 'validate_marks',
        task_status: 'pending',
      },
      {
        $set: {
          task_status: 'completed',
          updated_at: new Date(),
        },
      }
    );

    return validateMarks;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * Soft delete a StudentTestResult by setting its status to 'deleted' and recording the deletion date.
 *
 * @param {Object} _ - Unused first resolver argument (parent/root).
 * @param {string} _id - The ID of the StudentTestResult to delete.
 * @returns {Promise<string>} The ID of the deleted StudentTestResult.
 *
 * @throws {ApolloError} If the ID is invalid or the StudentTestResult is not found or already deleted.
 */
async function DeleteStudentTestResult(_, { _id }) {
  try {
    // *************** Validate StudentTestResult ID (must be valid MongoDB ObjectId)
    CommonValidator.ValidateObjectId(_id, 'StudentTestResult ID');

    const deletedStudentTestResult = await StudentTestResultModel.updateOne(
      { _id, student_test_result_status: 'active' },
      {
        $set: {
          student_test_result_status: 'deleted',
          deleted_at: new Date(),
        },
      }
    );

    // *************** Handle case if StudentTestResult not found or already deleted
    if (deletedStudentTestResult.matchedCount === 0) {
      throw new ApolloError(
        'StudentTestResult not found or already deleted.',
        'STUDENT_TEST_RESULT_NOT_FOUND'
      );
    }

    return _id;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

// *************** LOADER ***************

/**
 * Resolves the student associated with a StudentTestResult using DataLoader.
 *
 * @function student_id
 * @param {Object} parent - The parent object containing the student_id.
 * @param {Object} context - GraphQL context containing DataLoaders.
 * @param {Object} context.loaders - An object containing all DataLoaders.
 * @param {Function} context.loaders.StudentLoader - DataLoader for fetching students by ID.
 * @returns {Promise<Object|null>} The associated student document or null if invalid ID.
 */
async function student_id(parent, args, { loaders }) {
  // *************** Validate student_id format; return null if invalid ObjectId
  CommonValidator.ValidateObjectId(parent.student_id);

  // *************** Load the student document using DataLoader
  const loadedStudent = await loaders.StudentLoader.load(
    String(parent.student_id)
  );

  // *************** Return the resolved student document
  return loadedStudent;
}

/**
 * Resolves the `test_id` field on a StudentTestResult document using DataLoader.
 *
 * @param {Object} parent - The parent object, expected to contain the `test_id` field.
 * @param {Object} context - GraphQL context object.
 * @param {Object} context.loaders - An object containing DataLoader instances.
 * @param {Function} context.loaders.TestLoader - DataLoader instance for loading Test documents by ID.
 *
 * @returns {Promise<Object|null>} The loaded Test document, or null if not found or ID is invalid.
 *
 * @throws {ApolloError} If `test_id` is not a valid MongoDB ObjectId or a DataLoader error occurs.
 */
async function test_id(parent, args, { loaders }) {
  // *************** sanity check to ensure parent.test_ids is an array with elements before attempting to use DataLoader
  CommonValidator.ValidateObjectId(parent.test_id);

  const loadedTest = await loaders.TestLoader.load(String(parent.test_id));

  return loadedTest;
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetOneStudentTestResult,
    GetAllStudentTestResults,
  },
  Mutation: {
    EnterMarks,
    ValidateMarks,
    DeleteStudentTestResult,
  },
  StudentTestResult: {
    student_id: student_id,
    test_id: test_id,
  },
};
