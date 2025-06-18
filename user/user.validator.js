// *************** IMPORT CORE ***************
const mongoose = require('mongoose');
const validator = require('validator');
const { ApolloError } = require('apollo-server-express');

/**
 * Validates the civility value.
 *
 * @param {string} civility - The civility to validate (e.g., "Mr" or "Mrs").
 * @throws {Error} If civility is missing or not one of the allowed values.
 */
function ValidateCivility(civility) {
  // *************** Check if civility is falsy or not a string
  if (
    !civility ||
    typeof civility !== 'string' ||
    !['Mr', 'Mrs'].includes(civility)
  ) {
    throw new ApolloError(
      "Civility is required and must be either 'Mr' or 'Mrs'.",
      'INVALID_CIVILITY'
    );
  }
}

/**
 * Validates that a given value is a non-empty string.
 *
 * @param {string} value - The string value to validate.
 * @param {string} fieldName - The name of the field being validated (used in error message).
 * @throws {Error} If the value is empty, not a string, or only whitespace.
 */
function ValidateNonEmptyString(value, fieldName) {
  // *************** Check if value is falsy or not a string
  if (!value || typeof value !== 'string' || value.trim() === '') {
    throw new ApolloError(
      `${fieldName} is required and must be a non-empty string.`,
      'INVALID_STRING'
    );
  }
}

/**
 * Validates that an email is in correct format.
 *
 * @param {string} email - The email to validate.
 * @throws {Error} If the email is missing or not a valid format.
 */
function ValidateEmail(email) {
  // *************** Check if email is missing, not a string, or invalid format
  if (!email || typeof email !== 'string' || !validator.isEmail(email)) {
    throw new ApolloError(
      'Email is required and must be a valid format.',
      'INVALID_EMAIL'
    );
  }
}

/**
 * Validates that a password meets minimum length requirements.
 *
 * @param {string} password - The password to validate.
 * @throws {Error} If the password is missing or shorter than 6 characters.
 */
function ValidatePassword(password) {
  // *************** Check if password is missing, not a string, or too short
  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new ApolloError(
      'Password is required and must be at least 6 characters long.',
      'INVALID_PASSWORD'
    );
  }
}

/**
 * Validates that the role is within the list of accepted values.
 *
 * @param {string} role - The role to validate.
 * @param {boolean} [required=false] - Whether the role field is mandatory.
 * @throws {Error} If role is missing (when required) or invalid.
 */
function ValidateRole(role, required = false) {
  // *************** Define allowed roles
  const validRoles = ['operator', 'acadir', 'student'];
  // *************** If role is required and missing
  if (required && !role) {
    throw new ApolloError('Role is required.', 'ROLE_REQUIRED');
  }
  // *************** If role is provided but not in allowed list or not a string
  if (role && (!validRoles.includes(role) || typeof role !== 'string')) {
    throw new ApolloError(
      `Role must be one of: ${validRoles.join(', ')}.`,
      'INVALID_ROLE'
    );
  }
}

/**
 * Validates that a value is a valid MongoDB ObjectId.
 *
 * @param {string} id - The ID to validate.
 * @param {string} fieldName - The name of the field (for error message context).
 * @throws {Error} If the id is not a valid ObjectId.
 */

function ValidateUserInput(input) {
  const { civility, first_name, last_name, email, password, role } = input;

  ValidateCivility(civility);
  ValidateNonEmptyString(first_name, 'First name');
  ValidateNonEmptyString(last_name, 'Last name');
  ValidateEmail(email);
  ValidatePassword(password);
  ValidateRole(role);
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateCivility,
  ValidateNonEmptyString,
  ValidateEmail,
  ValidatePassword,
  ValidateRole,
  ValidateUserInput,
};
