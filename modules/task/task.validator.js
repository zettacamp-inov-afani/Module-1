// *************** IMPORT CORE ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT VALIDATOR ***************
const CommonValidator = require('../../utilities/validator');

const task_types = ['assign_corrector', 'enter_marks', 'validate_marks'];
const task_statuses = ['pending', 'in_progress', 'completed'];

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
