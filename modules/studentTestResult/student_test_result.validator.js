// *************** IMPORT CORE ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT VALIDATOR ***************
const CommonValidator = require('../../utilities/validator');

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
