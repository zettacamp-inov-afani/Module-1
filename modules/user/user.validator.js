// *************** IMPORT CORE ***************
const validator = require('validator');
const { ApolloError } = require('apollo-server-express');

/**
 * Validates user input for both create and update operations.
 *
 * @param {Object} input - The user input object.
 * @param {boolean} [isUpdate=false] - Whether this is an update operation (fields optional).
 *
 * @throws {ApolloError} If any field is invalid.
 */
function ValidateUserInput(input, isUpdate = false) {
  const { civility, first_name, last_name, email, password, role } = input;

  // *************** Civility validation
  if (!isUpdate || civility !== undefined) {
    if (typeof civility !== 'string' || !['Mr', 'Mrs'].includes(civility)) {
      throw new ApolloError(
        "Civility is required and must be either 'Mr' or 'Mrs'.",
        'INVALID_CIVILITY'
      );
    }
  }

  // *************** First name validation
  if (!isUpdate || first_name !== undefined) {
    if (typeof first_name !== 'string' || first_name.trim() === '') {
      throw new ApolloError(
        'First name is required and must be a non-empty string.',
        'INVALID_STRING'
      );
    }
  }

  // *************** Last name validation
  if (!isUpdate || last_name !== undefined) {
    if (typeof last_name !== 'string' || last_name.trim() === '') {
      throw new ApolloError(
        'Last name is required and must be a non-empty string.',
        'INVALID_STRING'
      );
    }
  }

  // *************** Email validation
  if (!isUpdate || email !== undefined) {
    if (typeof email !== 'string' || !validator.isEmail(email)) {
      throw new ApolloError(
        'Email is required and must be a valid format.',
        'INVALID_EMAIL'
      );
    }
  }

  // *************** Password validation
  if (!isUpdate || password !== undefined) {
    if (typeof password !== 'string' || password.length < 6) {
      throw new ApolloError(
        'Password is required and must be at least 6 characters long.',
        'INVALID_PASSWORD'
      );
    }
  }

  // *************** Role validation
  if (!isUpdate || role !== undefined) {
    const validRoles = ['operator', 'acadir', 'student'];

    if (!isUpdate && !role) {
      throw new ApolloError('Role is required.', 'ROLE_REQUIRED');
    }

    if (role && (!validRoles.includes(role) || typeof role !== 'string')) {
      throw new ApolloError(
        `Role must be one of: ${validRoles.join(', ')}.`,
        'INVALID_ROLE'
      );
    }
  }
}

module.exports = ValidateUserInput;
