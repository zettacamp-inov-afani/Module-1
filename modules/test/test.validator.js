// *************** IMPORT CORE ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT VALIDATOR ***************
const CommonValidator = require('../../utilities/validator');

function ValidateTestInput(input) {
  // *************** Validate that the input exists and is an object
  if (!input || typeof input !== 'object') {
    throw new ApolloError(
      'Input must be a valid object.',
      'INVALID_TEST_INPUT'
    );
  }

  // *************** Validate name
  if (typeof input.name !== 'string' || input.name.trim() === '') {
    throw new ApolloError(
      'name must be a non-empty string.',
      'INVALID_TEST_NAME'
    );
  }

  // *************** Validate description
  if (
    typeof input.description !== 'string' ||
    input.description.trim() === ''
  ) {
    throw new ApolloError(
      'description must be a non-empty string.',
      'INVALID_TEST_DESCRIPTION'
    );
  }

  // *************** Validate weight
  if (typeof input.weight !== 'number') {
    throw new ApolloError('Weight must be a number.', 'INVALID_NUMBER');
  }

  if (input.weight < 0) {
    throw new ApolloError(
      'Weight must be greater than or equal to 0.',
      'INVALID_WEIGHT_VALUE'
    );
  }

  // *************** Validate that the notations input is an array
  if (!Array.isArray(input.notations)) {
    throw new ApolloError(
      'Notations must be an array.',
      'INVALID_NOTATION_ARRAY'
    );
  }

  input.notations.forEach((notation, index) => {
    // *************** Validate that the input exists and is an object
    if (typeof notation !== 'object' || notation === null) {
      throw new ApolloError(
        `Notation[${index}] must be an object.`,
        'INVALID_NOTATION_OBJECT'
      );
    }

    // *************** Validate notation_text
    if (
      typeof notation.notation_text !== 'string' ||
      notation.notation_text.trim() === ''
    ) {
      throw new ApolloError(
        `Notation[${index}].notation_text must be a non-empty string.`,
        'INVALID_NOTATION_DETAIL'
      );
    }

    // *************** Validate max_points
    if (typeof notation.max_points !== 'number') {
      throw new ApolloError(
        'Max points must be a number.',
        'INVALID_MAX_POINTS'
      );
    }

    if (notation.max_points < 0) {
      throw new ApolloError(
        'Max points must be greater than or equal to 0.',
        'INVALID_MAX_POINTS_VALUE'
      );
    }
  });

  // *************** Validate subject_id
  CommonValidator.ValidateObjectId(input.subject_id, 'Subject ID');
}

function ValidatePublishTestInput(input) {
  // *************** Validate that user_id is provided
  if (!input || !input.user_id) {
    throw new ApolloError('User ID is required.', 'USER_ID_REQUIRED');
  }

  // *************** Validate that user_id is a valid MongoDB ObjectId
  CommonValidator.ValidateObjectId(input.user_id, 'User ID');

  // *************** Validate due_date if provided (optional)
  if (input.due_date) {
    const parsedDate = new Date(input.due_date);
    if (isNaN(parsedDate)) {
      throw new ApolloError(
        'due_date must be a valid date.',
        'INVALID_DUE_DATE'
      );
    }
  }
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateTestInput, ValidatePublishTestInput };
