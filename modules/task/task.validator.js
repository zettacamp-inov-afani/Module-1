// *************** IMPORT CORE ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT VALIDATOR ***************
const CommonValidator = require('../../utilities/validator');

// *************** GLOBAL VARIABLE ***************
const task_types = ['assign_corrector', 'enter_marks', 'validate_marks'];
const task_statuses = ['pending', 'in_progress', 'completed'];

/**
 * Validates the input object for creating or updating a Task.
 *
 * This function performs the following validations:
 * - Ensures the input is a valid object.
 * - Validates that `test_id` and `user_id` are valid MongoDB ObjectIds.
 * - Validates that `task_type` is one of the allowed enum values.
 * - Validates that `task_status` is one of the allowed enum values.
 * - Validates that `due_date` (if provided) is a valid date.
 *
 * @param {Object} input - The input object containing task details.
 * @param {string} input.test_id - The ID of the Test associated with the Task.
 * @param {string} input.user_id - The ID of the User assigned to the Task.
 * @param {string} input.task_type - The type of the Task (must match enum `task_types`).
 * @param {string} input.task_status - The status of the Task (must match enum `task_statuses`).
 * @param {string} [input.due_date] - Optional due date string for the Task.
 *
 * @throws {ApolloError} If any validation rule fails.
 */
function ValidateTaskInput(input) {
  // *************** Validate that the input exists and is an object
  if (!input || typeof input !== 'object') {
    throw new ApolloError(
      'Input must be a valid object.',
      'INVALID_TEST_INPUT'
    );
  }

  // *************** Validate test_id
  CommonValidator.ValidateObjectId(input.test_id, 'Test ID');

  // *************** Validate user_id
  CommonValidator.ValidateObjectId(input.user_id, 'User ID');

  // Validate enum task_type
  if (!task_types.includes(input.task_type)) {
    throw new ApolloError(
      `task_type must be one of: ${task_types.join(', ')}`,
      'INVALID_TASK_TYPE'
    );
  }

  // Validate enum task_status
  if (!task_statuses.includes(input.task_status)) {
    throw new ApolloError(
      `task_type must be one of: ${task_statuses.join(', ')}`,
      'INVALID_TASK_TYPE'
    );
  }

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
module.exports = ValidateTaskInput;
