// *************** IMPORT CORE ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT VALIDATOR ***************
const CommonValidator = require('../../utilities/validator');

function ValidateSubjectInput(input) {
  // *************** Validate that the input exists and is an object
  if (!input || typeof input !== 'object') {
    throw new ApolloError(
      'Input must be a valid object.',
      'INVALID_SUBJECT_INPUT'
    );
  }

  // *************** Validate name
  if (typeof input.name !== 'string' || input.name.trim() === '') {
    throw new ApolloError(
      'name must be a non-empty string.',
      'INVALID_SUBJECT_NAME'
    );
  }

  // *************** Validate description
  if (
    typeof input.description !== 'string' ||
    input.description.trim() === ''
  ) {
    throw new ApolloError(
      'description must be a non-empty string.',
      'INVALID_SUBJECT_DESCRIPTION'
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

  if (input.test_ids !== undefined) {
    if (!Array.isArray(input.test_ids)) {
      throw new ApolloError('test_ids must be an array.', 'INVALID_TEST_IDS');
    }

    input.test_ids.forEach((id, index) => {
      CommonValidator.ValidateObjectId(id, `Test ID at index ${index}`);
    });
  }
}

// *************** EXPORT MODULE ***************
module.exports = ValidateSubjectInput;
