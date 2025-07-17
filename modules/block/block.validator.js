// *************** IMPORT CORE ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT VALIDATOR ***************
const CommonValidator = require('../../utilities/validator');

/**
 * Validates the input object for creating or updating a Block.
 *
 * Throws an ApolloError with descriptive messages if validation fails.
 *
 * @param {Object} input - The block input object to validate.
 * @param {string} input.name - The name of the block.
 * @param {string} input.description - The description of the block.
 * @param {string[]} [input.subject_ids] - Optional array of subject MongoDB ObjectIds.
 * @param {Object[]} [input.criteria] - Optional array of criteria groups.
 * @param {string} input.criteria[].goal - The target outcome ("PASS" or "FAIL").
 * @param {Object[]} input.criteria[].rules - Array of rule objects within the group.
 * @param {string} input.criteria[].rules[].logical_operator - Logical operator ("AND" or "OR").
 * @param {string} input.criteria[].rules[].operator - Comparison operator ("GT", "GTE", "LT", "LTE", "EQ").
 * @param {string} input.criteria[].rules[].type - Type of data ("total_mark" or "subject_result").
 * @param {string} input.criteria[].rules[].subject_id - MongoDB ObjectId of the subject.
 * @param {string} input.criteria[].rules[].test_id - MongoDB ObjectId of the test.
 * @param {number} input.criteria[].rules[].value - The target value to compare against.
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

        if (!['total_mark', 'subject_result'].includes(rule.type)) {
          throw new ApolloError(
            `${ruleLabel}.operator must be one of "total_mark", "subject_result".``INVALID_CRITERIA_TYPE`
          );
        }

        if (rule.subject_id !== undefined) {
          CommonValidator.ValidateObjectId(
            rule.subject_id,
            `${ruleLabel}.subject_id`
          );
        }

        if (rule.test_id !== undefined) {
          CommonValidator.ValidateObjectId(
            rule.test_id,
            `${ruleLabel}.test_id`
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

// *************** EXPORT MODULE ***************
module.exports = ValidateBlockInput;
