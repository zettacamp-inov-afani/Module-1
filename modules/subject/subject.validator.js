// *************** IMPORT CORE ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT VALIDATOR ***************
const CommonValidator = require('../../utilities/validator');

/**
 * Validates the input data for creating or updating a Subject.
 *
 *
 * @function
 * @param {Object} input - The subject input object to validate.
 * @param {string} input.name - Name of the subject.
 * @param {string} input.description - Description of the subject.
 * @param {number} input.coefficient - Coefficient for the subject's weight.
 * @param {string} input.block_id - MongoDB ObjectId of the parent Block.
 * @param {string[]} [input.test_ids] - Optional array of related Test ObjectIds.
 * @param {Array<Object>} [input.criteria] - Optional evaluation criteria.
 * @param {string} input.criteria[].goal - Evaluation outcome: "PASS" or "FAIL".
 * @param {Array<Object>} input.criteria[].rules - Rules to determine the goal.
 * @param {string} input.criteria[].rules[].logical_operator - "AND" or "OR".
 * @param {string} input.criteria[].rules[].operator - Comparison operator: "GT", "GTE", "LT", "LTE", "EQ".
 * @param {string} input.criteria[].rules[].type - Type of value to compare: "total_mark" or "test_result".
 * @param {string} input.criteria[].rules[].test_id - MongoDB ObjectId of the related Test.
 * @param {number} input.criteria[].rules[].value - The numeric value to compare against.
 *
 * @throws {ApolloError} If any field is invalid or missing.
 */
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

        if (!['total_mark', 'test_result'].includes(rule.type)) {
          throw new ApolloError(
            `${ruleLabel}.operator must be one of "total_mark", "test_result".``INVALID_CRITERIA_TYPE`
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
module.exports = ValidateSubjectInput;
