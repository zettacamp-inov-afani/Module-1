// *************** IMPORT CORE ***************
const validator = require('validator');
const { ApolloError } = require('apollo-server-express');

// *************** GLOBAL VARIABLE ***************
const allowedCivilities = ['Mr', 'Mrs'];

/**
 * Validates student input fields for both create and update operations.
 *
 * @param {Object} input - The input object containing student data.
 * @param {boolean} [isUpdate=false] - Indicates whether the validation is for an update operation.
 *                                     If true, only present fields will be validated.
 *
 * @throws {ApolloError} If any required field is missing or invalid.
 *
 * Fields validated include:
 * - civility: must be 'Mr' or 'Mrs' (if present or not in update mode)
 * - first_name, last_name, place_of_birth, postal_code_of_birth, tele_phone: must be non-empty strings
 * - email: must be a valid email string
 * - date_of_birth: must be a valid date string
 */
function ValidateStudentInput(input, isUpdate = false) {
  // *************** Check input validity
  if (!input || typeof input !== 'object') {
    throw new ApolloError(
      'Input must be a valid object.',
      'INVALID_STUDENT_INPUT'
    );
  }

  const {
    civility,
    first_name,
    last_name,
    email,
    tele_phone,
    date_of_birth,
    place_of_birth,
    postal_code_of_birth,
  } = input;

  // *************** Validate civility
  if (!isUpdate || civility !== undefined) {
    if (typeof civility !== 'string' || !allowedCivilities.includes(civility)) {
      throw new ApolloError(
        "Civility must be either 'Mr' or 'Mrs'.",
        'INVALID_CIVILITY'
      );
    }
  }

  // *************** Validate first_name
  if (!isUpdate || first_name !== undefined) {
    if (typeof first_name !== 'string' || first_name.trim() === '') {
      throw new ApolloError(
        'First name must be a non-empty string.',
        'INVALID_STRING'
      );
    }
  }

  // *************** Validate last_name
  if (!isUpdate || last_name !== undefined) {
    if (typeof last_name !== 'string' || last_name.trim() === '') {
      throw new ApolloError(
        'Last name must be a non-empty string.',
        'INVALID_STRING'
      );
    }
  }

  // *************** Validate email
  if (!isUpdate || email !== undefined) {
    if (typeof email !== 'string' || !validator.isEmail(email)) {
      throw new ApolloError('Email must be valid.', 'INVALID_EMAIL');
    }
  }

  // *************** Validate date_of_birth
  if (!isUpdate || date_of_birth !== undefined) {
    if (!date_of_birth || isNaN(Date.parse(date_of_birth))) {
      throw new ApolloError(
        'Date of birth must be a valid date.',
        'INVALID_DATE'
      );
    }
  }

  // *************** Validate place_of_birth
  if (!isUpdate || place_of_birth !== undefined) {
    if (typeof place_of_birth !== 'string' || place_of_birth.trim() === '') {
      throw new ApolloError(
        'Place of birth must be a non-empty string.',
        'INVALID_STRING'
      );
    }
  }

  // *************** Validate postal_code_of_birth
  if (!isUpdate || postal_code_of_birth !== undefined) {
    if (
      typeof postal_code_of_birth !== 'string' ||
      postal_code_of_birth.trim() === ''
    ) {
      throw new ApolloError(
        'Postal code of birth must be a non-empty string.',
        'INVALID_STRING'
      );
    }
  }

  // *************** Validate telephone
  if (!isUpdate || tele_phone !== undefined) {
    if (typeof tele_phone !== 'string' || tele_phone.trim() === '') {
      throw new ApolloError(
        'Telephone must be a non-empty string.',
        'INVALID_STRING'
      );
    }
  }
}

// *************** EXPORT MODULE ***************
module.exports = ValidateStudentInput;
