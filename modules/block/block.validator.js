// *************** IMPORT CORE ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT VALIDATOR ***************
const CommonValidator = require('../../utilities/validator');

/**
 * Validates the input payload for creating or updating a Block.
 *
 * This function performs the following checks:
 * - Ensures the input is a valid object.
 * - Validates that `name` is a non-empty string.
 * - Validates that `description` is a non-empty string.
 * - If `subject_ids` is provided:
 *   - Ensures it is an array.
 *   - Validates each element in `subject_ids` as a valid MongoDB ObjectId.
 *
 * Throws an `ApolloError` with specific error codes if validation fails.
 *
 * @param {Object} input - The input object to validate.
 * @param {string} input.name - The name of the block.
 * @param {string} input.description - The description of the block.
 * @param {string[]} [input.subject_ids] - Optional array of Subject ObjectIds.
 *
 * @throws {ApolloError} If any validation rule fails.
 */
function ValidateBlockInput(input) {
  // *************** Validate that the input exists and is an object
  if (!input || typeof input !== 'object') {
    throw new ApolloError(
      'Input must be a valid object.',
      'INVALID_BLOCK_INPUT'
    );
  }

  // *************** Validate name
  if (typeof input.name !== 'string' || input.name.trim() === '') {
    throw new ApolloError(
      'name must be a non-empty string.',
      'INVALID_BLOCK_NAME'
    );
  }

  // *************** Validate description
  if (
    typeof input.description !== 'string' ||
    input.description.trim() === ''
  ) {
    throw new ApolloError(
      'description must be a non-empty string.',
      'INVALID_BLOCK_DESCRIPTION'
    );
  }

  // *************** Validate subject_ids (if provided)
  if (input.subject_ids !== undefined) {
    if (!Array.isArray(input.subject_ids)) {
      throw new ApolloError(
        'subject_ids must be an array of IDs.',
        'INVALID_SUBJECT_IDS'
      );
    }

    input.subject_ids.forEach((subjectId) => {
      CommonValidator.ValidateObjectId(subjectId, 'Subject ID');
    });
  }
}

// *************** EXPORT MODULE ***************
module.exports = ValidateBlockInput;
