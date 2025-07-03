// *************** IMPORT LIBRARY ***************
const { isEmail } = require('validator');
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT VALIDATORS ***************
const CommonValidator = require('../../utilities/validator');

// *************** GLOBAL VARIABLE ***************
const allowedCivilities = ['Mr', 'Mrs'];

/**
 * Validates student input fields (for create or update — all fields are required).
 *
 * @param {Object} input - The input object containing student data.
 *
 * @throws {ApolloError} If any required field is missing or invalid.
 */
function ValidateStudentInput(input) {
  // *************** Check input validity
  if (!input || typeof input !== 'object') {
    throw new ApolloError(
      'Input must be a valid object.',
      'INVALID_STUDENT_INPUT'
    );
  }

  // *************** Validate civility
  if (
    typeof input.civility !== 'string' ||
    !allowedCivilities.includes(input.civility)
  ) {
    throw new ApolloError(
      "Civility must be either 'Mr' or 'Mrs'.",
      'INVALID_CIVILITY'
    );
  }

  // *************** Validate first_name
  if (typeof input.first_name !== 'string' || input.first_name.trim() === '') {
    throw new ApolloError(
      'First name must be a non-empty string.',
      'INVALID_STRING'
    );
  }

  // *************** Validate last_name
  if (typeof input.last_name !== 'string' || input.last_name.trim() === '') {
    throw new ApolloError(
      'Last name must be a non-empty string.',
      'INVALID_STRING'
    );
  }

  // *************** Validate email
  if (typeof input.email !== 'string' || !isEmail(input.email)) {
    throw new ApolloError('Email must be valid.', 'INVALID_EMAIL');
  }

  // *************** Validate date_of_birth
  if (!input.date_of_birth || isNaN(Date.parse(input.date_of_birth))) {
    throw new ApolloError(
      'Date of birth must be a valid date.',
      'INVALID_DATE'
    );
  }

  // *************** Validate place_of_birth
  if (
    typeof input.place_of_birth !== 'string' ||
    input.place_of_birth.trim() === ''
  ) {
    throw new ApolloError(
      'Place of birth must be a non-empty string.',
      'INVALID_STRING'
    );
  }

  // *************** Validate postal_code_of_birth
  if (
    typeof input.postal_code_of_birth !== 'string' ||
    input.postal_code_of_birth.trim() === ''
  ) {
    throw new ApolloError(
      'Postal code of birth must be a non-empty string.',
      'INVALID_STRING'
    );
  }

  // *************** Validate telephone
  if (typeof input.tele_phone !== 'string' || input.tele_phone.trim() === '') {
    throw new ApolloError(
      'Telephone must be a non-empty string.',
      'INVALID_STRING'
    );
  }

  // *************** Validate school_id
  CommonValidator.ValidateObjectId(input.school_id, 'School ID');
}

// *************** EXPORT MODULE ***************
module.exports = ValidateStudentInput;
