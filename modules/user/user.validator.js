// *************** IMPORT LIBRARY ***************
const validator = require('validator');
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
  const { civility, first_name, last_name, email, password, role } = input;

  // *************** Civility validation
  if (typeof civility !== 'string' || !allowedCivilities.includes(civility)) {
    throw new ApolloError(
      `Civility must be either 'Mr' or 'Mrs'.`,
      'INVALID_CIVILITY'
    );
  }

  // *************** First name validation
  if (typeof first_name !== 'string' || first_name.trim() === '') {
    throw new ApolloError(
      'First name must be a non-empty string.',
      'INVALID_STRING'
    );
  }

  // *************** Last name validation
  if (typeof last_name !== 'string' || last_name.trim() === '') {
    throw new ApolloError(
      'Last name must be a non-empty string.',
      'INVALID_STRING'
    );
  }

  // *************** Email validation
  if (typeof email !== 'string' || !validator.isEmail(email)) {
    throw new ApolloError('Email must be a valid format.', 'INVALID_EMAIL');
  }

  // *************** Password validation
  if (typeof password !== 'string' || password.length < 6) {
    throw new ApolloError(
      'Password must be at least 6 characters long.',
      'INVALID_PASSWORD'
    );
  }

  // *************** Role validation
  if (typeof role !== 'string' || !allowedRoles.includes(role)) {
    throw new ApolloError(
      `Civility must be either 'operator', 'acadir' or 'student'.`,
      'INVALID_ROLE'
    );
  }
}

// *************** EXPORT MODULE ***************
module.exports = ValidateUserInput;
