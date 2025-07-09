// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const StudentTestResultModel = require('./student_test_result.model');
const TaskModel = require('../task/task.model');
const TestModel = require('../test/test.model');
const StudentModel = require('../student/student.model');

// *************** IMPORT VALIDATOR ***************
const ValidateStudentTestResultInput = require('./student_test_result.validator');
const CommonValidator = require('../../utilities/validator');

// *************** QUERY ***************

/**
 * Get a single active StudentTestResult document by its ID.
 *
 * This function:
 * - Validates the provided ID.
 * - Finds a StudentTestResult with matching _id and `student_test_result_status: 'active'`.
 * - Returns the document if found.
 * - Throws an error if the result is not found or already deleted.
 *
 * @returns {Promise<Object>} The active StudentTestResult document.
 * @throws {ApolloError} If validation fails or document is not found.
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

    if (Array.isArray(input.marks) && input.marks.length > 0) {
      for (let i = 0; i < input.marks.length; i++) {
        total += input.marks[i].mark;
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
 * Update an active StudentTestResult document by its ID.
 *
 * @returns {Promise<Object>} The updated StudentTestResult.
 * @throws {ApolloError} If ID is invalid or record not found/deleted.
 */
async function UpdateMarks(_, { _id, input }) {
  try {
    // *************** Validate Student Test Result ID (must be valid MongoDB ObjectId)
    CommonValidator.ValidateObjectId(_id, 'StudentTestResult ID');

    // *************** Validate student test result input
    ValidateStudentTestResultInput(input);

    const updateFields = {
      student_id: input.student_id,
      test_id: input.test_id,
      marks: input.marks,
      average_mark: input.average_mark,
    };

    // *************** Update the student test result data if active
    const updatedStudentTestResult =
      await StudentTestResultModel.findOneAndUpdate(
        { _id: _id, student_test_result_status: 'active' },
        { $set: updateFields },
        { new: true }
      ).lean();

    // *************** Handle case if StudentTestResult not found or already deleted
    if (!updatedStudentTestResult) {
      throw new ApolloError(
        'StudentTestResult not found or already deleted.',
        'STUDENT_TEST_RESULT_NOT_FOUND'
      );
    }

    return updatedStudentTestResult;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * Validates a student's test result by setting the validation date and
 * completing the corresponding "Validate Marks" task.
 *
 * This function:
 * - Updates the `mark_validate_date` field on the StudentTestResult document.
 * - Changes the status of the associated "Validate Marks" task to `completed`.
 *
 * @returns {Promise<Object>} The updated StudentTestResult document.
 * @throws {ApolloError} If the StudentTestResult is not found or a database error occurs.
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
 * Soft deletes a StudentTestResult by marking its status as 'deleted' and setting the deleted timestamp.
 *
 * @returns {Promise<string>} The ID of the soft-deleted StudentTestResult.
 * @throws {ApolloError} If the document is not found or a database error occurs.
 */
async function DeleteStudentTestResult(_, { _id }) {
  try {
    // *************** Validate StudentTestResult ID (must be valid MongoDB ObjectId)
    CommonValidator.ValidateObjectId(_id, 'StudentTestResult ID');

    const deletedStudentTestResult =
      await StudentTestResultModel.findOneAndUpdate(
        { _id, student_test_result_status: 'active' },
        {
          $set: {
            student_test_result_status: 'deleted',
            deleted_at: new Date(),
          },
        }
      );

    // *************** Handle case if StudentTestResult not found or already deleted
    if (!deletedStudentTestResult) {
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

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetOneStudentTestResult,
    GetAllStudentTestResults,
  },
  Mutation: {
    EnterMarks,
    UpdateMarks,
    ValidateMarks,
    DeleteStudentTestResult,
  },
  StudentTestResult: {
    student_id: student_id,
  },
};
