// *************** IMPORT CORE ***************
const mongoose = require('mongoose');
const validator = require('validator');

// *************** VALIDATION FUNCTIONS ***************

/**
 * Validates the civility value.
 *
 * @param {string} civility - The civility to validate (e.g., "Mr" or "Mrs").
 * @throws {Error} If civility is missing or not one of the allowed values.
 */
function ValidateCivility(civility) {
  if (
    !civility ||
    typeof civility !== 'string' ||
    !['Mr', 'Mrs'].includes(civility)
  ) {
    throw new Error("Civility is required and must be either 'Mr' or 'Mrs'.");
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
  if (!value || typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${fieldName} is required and must be a non-empty string.`);
  }
}

/**
 * Validates that an email is in correct format.
 *
 * @param {string} email - The email to validate.
 * @throws {Error} If the email is missing or not a valid format.
 */
function ValidateEmail(email) {
  if (!email || typeof email !== 'string' || !validator.isEmail(email)) {
    throw new Error('Email is required and must be a valid format.');
  }
}

/**
 * Validates that a password meets minimum length requirements.
 *
 * @param {string} password - The password to validate.
 * @throws {Error} If the password is missing or shorter than 6 characters.
 */
function ValidatePassword(password) {
  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new Error(
      'Password is required and must be at least 6 characters long.'
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
  const validRoles = ['operator', 'acadir', 'student'];
  if (required && !role) {
    throw new Error('Role is required.');
  }
  if (role && (!validRoles.includes(role) || typeof role !== 'string')) {
    throw new Error(`Role must be one of: ${validRoles.join(', ')}.`);
  }
}

/**
 * Validates that a value is a valid MongoDB ObjectId.
 *
 * @param {string} id - The ID to validate.
 * @param {string} fieldName - The name of the field (for error message context).
 * @throws {Error} If the id is not a valid ObjectId.
 */
function ValidateObjectId(id, fieldName) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`${fieldName} is required and must be a valid ObjectId.`);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateCivility,
  ValidateNonEmptyString,
  ValidateEmail,
  ValidatePassword,
  ValidateRole,
  ValidateObjectId,
};
