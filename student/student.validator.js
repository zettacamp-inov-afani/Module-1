// *************** IMPORT CORE ***************
const mongoose = require('mongoose');
const validator = require('validator');
const { ApolloError } = require('apollo-server-express');

// *************** GLOBAL VARIABLE ***************
const allowedCivilities = ['Mr', 'Mrs'];

/**
 * Validates civility value to ensure it is one of the allowed options.
 *
 * @param {string} civility - The civility to validate (e.g., 'Mr' or 'Mrs').
 * @throws {Error} If the civility is missing or invalid.
 */
function ValidateCivility(civility) {
  // *************** Check if civility is missing (null/undefined/empty)
  if (
    !civility ||
    typeof civility !== 'string' ||
    !allowedCivilities.includes(civility)
  ) {
    throw new ApolloError(
      "Civility is required and must be either 'Mr' or 'Mrs'.",
      'INVALID_CIVILITY'
    );
  }
}

/**
 * Validates that a given string value is non-empty.
 *
 * @param {string} value - The string to validate.
 * @param {string} fieldName - The name of the field for the error message.
 * @throws {Error} If the value is not a non-empty string.
 */
function ValidateNonEmptyString(value, fieldName) {
  // *************** Check if value is missing (null/undefined/empty)
  if (!value || typeof value !== 'string' || value.trim() === '') {
    throw new ApolloError(
      `${fieldName} is required and must be a non-empty string.`,
      'INVALID_STRING'
    );
  }
}

/**
 * Validates an email address format.
 *
 * @param {string} email - The email to validate.
 * @throws {Error} If the email is missing or not in a valid format.
 */
function ValidateEmail(email) {
  // *************** Check if email is missing and not match the format
  if (!email || typeof email !== 'string' || !validator.isEmail(email)) {
    throw new ApolloError(
      'Email is required and must be a valid format.',
      'INVALID_EMAIL'
    );
  }
}

/**
 * Validates that a given value is a valid date.
 *
 * @param {string|Date} date - The date value to validate.
 * @param {string} [fieldName='Date'] - Optional field name for error messages.
 * @throws {Error} If the date is invalid or missing.
 */
function ValidateDate(date, fieldName = 'Date') {
  // *************** Check if date is missing OR cannot be parsed as a valid date
  if (!date || isNaN(Date.parse(date))) {
    throw new ApolloError(
      `${fieldName} is required and must be a valid date.`,
      'INVALID_DATE'
    );
  }
}

/**
 * Validates an array of MongoDB ObjectIds.
 *
 * @param {string[]} ids - The array of ObjectIds to validate.
 * @throws {Error} If the input is not an array or any ID is invalid.
 */
function ValidateMongoObjectIds(ids) {
  // *************** Check if the provided input is not an array
  if (!Array.isArray(ids)) {
    throw new ApolloError('IDs must be an array.', 'INVALID_ID_ARRAY');
  }

  // *************** Loop through each ID in the array
  ids.forEach((id, index) => {
    // *************** Check if the current ID is not a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApolloError(
        `ID at index ${index} is not a valid MongoDB ObjectId.`,
        'INVALID_OBJECT_ID'
      );
    }
  });
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateMongoObjectIds,
  ValidateCivility,
  ValidateNonEmptyString,
  ValidateEmail,
  ValidateDate,
};
