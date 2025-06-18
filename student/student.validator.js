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

function ValidateStudentInput(input) {
  const {
    civility,
    first_name,
    last_name,
    email,
    place_of_birth,
    postal_code_of_birth,
    date_of_birth,
    tele_phone,
  } = input;

  ValidateCivility(civility);
  ValidateNonEmptyString(first_name, 'First name');
  ValidateNonEmptyString(last_name, 'Last name');
  ValidateEmail(email);
  ValidateDate(date_of_birth, 'Date of Birth');
  ValidateNonEmptyString(place_of_birth, 'Place of birth');
  ValidateNonEmptyString(postal_code_of_birth, 'Postal code of birth');
  ValidateNonEmptyString(tele_phone, 'telephone');
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateCivility,
  ValidateNonEmptyString,
  ValidateEmail,
  ValidateDate,
  ValidateStudentInput,
};
