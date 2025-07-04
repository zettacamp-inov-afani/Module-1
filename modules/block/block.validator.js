// *************** IMPORT CORE ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT VALIDATORS ***************
const CommonValidator = require('../../utilities/validator');

function ValidateBlockInput(input) {
  // *************** Validate that the input exists and is an object
  if (!input || typeof input !== 'object') {
    throw new ApolloError(
      'Input must be a valid object.',
      'INVALID_SCHOOL_INPUT'
    );
  }

  // *************** Validate name
  if (typeof input.name !== 'string' || input.name.trim() === '') {
    throw new ApolloError(
      'name must be a non-empty string.',
      'INVALID_SCHOOL_LONG_NAME'
    );
  }

  // *************** Validate description
  if (
    typeof input.description !== 'string' ||
    input.description.trim() === ''
  ) {
    throw new ApolloError(
      'description must be a non-empty string.',
      'INVALID_SCHOOL_LONG_NAME'
    );
  }

  // *************** Validate subject_ids
  CommonValidator.ValidateObjectId(input.subject_id, 'School ID');
}

// *************** EXPORT MODULE ***************
module.exports = ValidateBlockInput;
