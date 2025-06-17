// *************** IMPORT CORE ***************
const mongoose = require('mongoose');
const validator = require('validator');

// *************** CONSTANT
const allowedCivilities = ['Mr', 'Mrs'];

// *************** VALIDATION FUNCTIONS

/**
 * Validates whether the provided value is a valid MongoDB ObjectId.
 *
 * @param {string} _id - The ID to validate.
 * @param {string} [fieldName='ID'] - Optional field name for error messages.
 * @throws {Error} If the ID is not a valid MongoDB ObjectId.
 */
function ValidateObjectId(_id, fieldName = 'ID') {
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    throw new Error(`${fieldName} is required and must be a valid ObjectId.`);
  }
}

/**
 * Validates civility value to ensure it is one of the allowed options.
 *
 * @param {string} civility - The civility to validate (e.g., 'Mr' or 'Mrs').
 * @throws {Error} If the civility is missing or invalid.
 */
function ValidateCivility(civility) {
  if (
    !civility ||
    typeof civility !== 'string' ||
    !allowedCivilities.includes(civility)
  ) {
    throw new Error("Civility is required and must be either 'Mr' or 'Mrs'.");
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
  if (!value || typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${fieldName} is required and must be a non-empty string.`);
  }
}

/**
 * Validates an email address format.
 *
 * @param {string} email - The email to validate.
 * @throws {Error} If the email is missing or not in a valid format.
 */
function ValidateEmail(email) {
  if (!email || typeof email !== 'string' || !validator.isEmail(email)) {
    throw new Error('Email is required and must be a valid format.');
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
  if (!date || isNaN(Date.parse(date))) {
    throw new Error(`${fieldName} is required and must be a valid date.`);
  }
}

/**
 * Validates an array of MongoDB ObjectIds.
 *
 * @param {string[]} ids - The array of ObjectIds to validate.
 * @throws {Error} If the input is not an array or any ID is invalid.
 */
function ValidateMongoObjectIds(ids) {
  if (!Array.isArray(ids)) {
    throw new Error('IDs must be an array.');
  }

  ids.forEach((id, index) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`ID at index ${index} is not a valid MongoDB ObjectId.`);
    }
  });
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateMongoObjectIds,
  ValidateObjectId,
  ValidateCivility,
  ValidateNonEmptyString,
  ValidateEmail,
  ValidateDate,
};
