// *************** IMPORT CORE ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT VALIDATOR ***************
const CommonValidator = require('../../utilities/validator');

/**
 * Validates the input object for creating or updating a Test.
 *
 * This function performs the following validations:
 * - Ensures the input is a valid object.
 * - Validates `name` and `description` are non-empty strings.
 * - Validates `weight` is a non-negative number.
 * - Validates `notations` is an array of valid objects with required fields:
 *   - `notation_text`: non-empty string
 *   - `max_points`: non-negative number
 * - Validates `subject_id` is a valid MongoDB ObjectId.
 *
 * @param {Object} input - The input object for Test creation or update.
 * @param {string} input.name - The name of the Test.
 * @param {string} input.description - The description of the Test.
 * @param {number} input.weight - The weight/importance of the Test.
 * @param {Array<Object>} input.notations - Array of notation objects.
 * @param {string} input.notations[].notation_text - Description of the notation.
 * @param {number} input.notations[].max_points - Maximum score for this notation.
 * @param {string} input.subject_id - The ID of the related Subject.
 *
 * @throws {ApolloError} If any validation rule fails.
 */
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

  // *************** Validate criteria
  if (input.criteria !== undefined) {
    if (!Array.isArray(input.criteria)) {
      throw new ApolloError(
        'criteria must be an array.',
        'INVALID_CRITERIA_ARRAY'
      );
    }

    input.criteria.forEach((group, index) => {
      const label = 'criteria[${index}]';

      // *************** Validate goal of criteria
      if (!['PASS', 'FAIL'].includes(group.goal)) {
        throw new ApolloError(
          `${label}.goal must be either "PASS" or "FAIL".`,
          'INVALID_CRITERIA_GOAL'
        );
      }

      // *************** Validate rules of criteria
      if (!Array.isArray(group.rules)) {
        throw new ApolloError(
          `${label}.rules must be an array.`,
          'INVALID_CRITERIA_RULES'
        );
      }

      group.rules.forEach((rule, rIdx) => {
        const ruleLabel = `${label}.rules[${rIdx}]`;

        if (!['AND', 'OR'].includes(rule.logical_operator)) {
          throw new ApolloError(
            `${ruleLabel}.operator must be one of "AND", "OR".``INVALID_LOGICAL_OPERATOR`
          );
        }

        if (!['GT', 'GTE', 'LT', 'LTE', 'EQ'].includes(rule.operator)) {
          throw new ApolloError(
            `${ruleLabel}.operator must be one of "GT", "GTE", "LT", "LTE", "EQ".``INVALID_OPERATOR`
          );
        }

        if (typeof rule.value !== 'number' || isNaN(rule.value)) {
          throw new ApolloError(
            `${ruleLabel}.value must be a valid number`,
            'INVALID_CRITERIA_VALUE'
          );
        }
      });
    });
  }
}

/**
 * Validates the input for publishing a test.
 *
 * Ensures that the `user_id` is provided and is a valid MongoDB ObjectId.
 * Optionally validates the `due_date` if it is provided.
 *
 * @param {Object} input - The input object containing user_id and optional due_date.
 * @param {string} input.user_id - The ID of the user assigned to the test.
 * @param {string} [input.due_date] - Optional due date string to be validated as a Date.
 *
 * @throws {ApolloError} Throws `USER_ID_REQUIRED` if user_id is missing.
 * @throws {ApolloError} Throws `INVALID_DUE_DATE` if due_date is provided but invalid.
 */
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
