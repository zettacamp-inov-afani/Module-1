// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const StudentTestResultModel = require('./student_test_result.model');
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

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetOneStudentTestResult,
  },
};
