// *************** IMPORT CORE ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT VALIDATOR ***************
const CommonValidator = require('../../utilities/validator');

/**
 * Validates the input payload for creating or updating a StudentTestResult.
 *
 * This function performs several validation steps:
 * - Ensures the input is a non-null object.
 * - Validates that `student_id` and `test_id` are valid MongoDB ObjectIds.
 * - Ensures `marks` is a non-empty array.
 * - For each mark object in the `marks` array:
 *   - Validates it is a non-null object.
 *   - Ensures `notation_text` is a non-empty string.
 *   - Validates that `mark` is a number greater than or equal to 0.
 *
 * Throws an `ApolloError` with specific error codes if any validation fails.
 *
 * @param {Object} input - The input object for StudentTestResult.
 * @param {string} input.student_id - MongoDB ObjectId string referencing the Student.
 * @param {string} input.test_id - MongoDB ObjectId string referencing the Test.
 * @param {Array<{notation_text: string, mark: number}>} input.marks - Array of marks, each containing a notation label and score.
 *
 * @throws {ApolloError} If the input is invalid, malformed, or missing required fields.
 */
function ValidateStudentTestResultInput(input) {
  // *************** Validate that the input exists and is an object
  if (!input || typeof input !== 'object') {
    throw new ApolloError(
      'Input must be a valid object.',
      'INVALID_TEST_INPUT'
    );
  }

  // *************** Validate student_id of StudentTestResult
  CommonValidator.ValidateObjectId(input.student_id, 'Student ID');

  // *************** Validate test_id of StudentTestResult
  CommonValidator.ValidateObjectId(input.test_id, 'Test ID');

  // *************** Validate that the notations input is an array
  if (!Array.isArray(input.marks)) {
    throw new ApolloError(
      'Notations must be an array.',
      'INVALID_NOTATION_ARRAY'
    );
  }

  input.marks.forEach((mark, index) => {
    // *************** Validate that the input exists and is an object
    if (typeof mark !== 'object' || mark === null) {
      throw new ApolloError(
        `mark[${index}] must be an object.`,
        'INVALID_MARKS_OBJECT'
      );
    }

    // *************** Validate notation_text
    if (
      typeof mark.notation_text !== 'string' ||
      mark.notation_text.trim() === ''
    ) {
      throw new ApolloError(
        `Mark[${index}].notation_text must be a non-empty string.`,
        'INVALID_NOTATION_DETAIL'
      );
    }

    // *************** Validate max_points
    if (typeof mark.mark !== 'number') {
      throw new ApolloError('Mark must be a number.', 'INVALID_MARK');
    }

    if (mark.mark < 0) {
      throw new ApolloError(
        'Mark must be greater than or equal to 0.',
        'INVALID_MARK'
      );
    }
  });
}

// *************** EXPORT MODULE ***************
module.exports = ValidateStudentTestResultInput;
