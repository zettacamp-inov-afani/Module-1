// *************** IMPORT CORE ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT VALIDATORS ***************
const CommonValidator = require('../../utilities/validator');

function ValidateSubjectInput(inputu) {
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

  // *************** Validate coefficient
  if (typeof input.coefficient !== 'number') {
    throw new ApolloError('Coefficient must be a number.', 'INVALID_NUMBER');
  }

  if (input.coefficient < 0) {
    throw new ApolloError(
      'Coefficient must be greater than or equal to 0.',
      'INVALID_COEFFICIENT_VALUE'
    );
  }

  // *************** Validate block_id
  CommonValidator.ValidateObjectId(input.block_id, 'Block ID');

  // *************** Validate test_ids
  CommonValidator.ValidateObjectId(input.test_ids, 'Test ID');
}

// *************** EXPORT MODULE ***************
module.exports = ValidateSubjectInput;
