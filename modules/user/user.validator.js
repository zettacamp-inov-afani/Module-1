// *************** IMPORT LIBRARY ***************
const { isEmail } = require('validator');
const { ApolloError } = require('apollo-server-express');

// *************** GLOBAL VARIABLES ***************
const allowedCivilities = ['Mr', 'Mrs'];
const allowedRoles = ['operator', 'acadir', 'student'];

/**
 * Validates user input (for create or update — all fields are required).
 *
 * @param {Object} input - The user input object.
 *
 * @throws {ApolloError} If any required field is missing or invalid.
 */
function ValidateUserInput(input) {
  // *************** Check input validity
  if (!input || typeof input !== 'object') {
    throw new ApolloError(
      'Input must be a valid object.',
      'INVALID_STUDENT_INPUT'
    );
  }

  // *************** Civility validation
  if (
    typeof input.civility !== 'string' ||
    !allowedCivilities.includes(input.civility)
  ) {
    throw new ApolloError(
      `Civility must be either 'Mr' or 'Mrs'.`,
      'INVALID_CIVILITY'
    );
  }

  // *************** First name validation
  if (typeof input.first_name !== 'string' || input.first_name.trim() === '') {
    throw new ApolloError(
      'First name must be a non-empty string.',
      'INVALID_STRING'
    );
  }

  // *************** Last name validation
  if (typeof input.last_name !== 'string' || input.last_name.trim() === '') {
    throw new ApolloError(
      'Last name must be a non-empty string.',
      'INVALID_STRING'
    );
  }

  // *************** Email validation
  if (typeof input.email !== 'string' || !isEmail(input.email)) {
    throw new ApolloError('Email must be a valid format.', 'INVALID_EMAIL');
  }

  // *************** Password validation
  if (typeof input.password !== 'string' || input.password.length < 6) {
    throw new ApolloError(
      'Password must be at least 6 characters long.',
      'INVALID_PASSWORD'
    );
  }

  // *************** Role validation
  if (typeof input.role !== 'string' || !allowedRoles.includes(input.role)) {
    throw new ApolloError(
      `Role must be either 'operator', 'acadir' or 'student'.`,
      'INVALID_ROLE'
    );
  }
}

// *************** EXPORT MODULE ***************
module.exports = ValidateUserInput;
