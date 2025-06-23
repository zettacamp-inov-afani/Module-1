// *************** IMPORT LIBRARY ***************
const validator = require('validator');
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

  const {
    civility,
    first_name,
    last_name,
    email,
    tele_phone,
    date_of_birth,
    place_of_birth,
    postal_code_of_birth,
    school_id,
  } = input;

  // *************** Validate civility
  if (typeof civility !== 'string' || !allowedCivilities.includes(civility)) {
    throw new ApolloError(
      "Civility must be either 'Mr' or 'Mrs'.",
      'INVALID_CIVILITY'
    );
  }

  // *************** Validate first_name
  if (typeof first_name !== 'string' || first_name.trim() === '') {
    throw new ApolloError(
      'First name must be a non-empty string.',
      'INVALID_STRING'
    );
  }

  // *************** Validate last_name
  if (typeof last_name !== 'string' || last_name.trim() === '') {
    throw new ApolloError(
      'Last name must be a non-empty string.',
      'INVALID_STRING'
    );
  }

  // *************** Validate email
  if (typeof email !== 'string' || !validator.isEmail(email)) {
    throw new ApolloError('Email must be valid.', 'INVALID_EMAIL');
  }

  // *************** Validate date_of_birth
  if (!date_of_birth || isNaN(Date.parse(date_of_birth))) {
    throw new ApolloError(
      'Date of birth must be a valid date.',
      'INVALID_DATE'
    );
  }

  // *************** Validate place_of_birth
  if (typeof place_of_birth !== 'string' || place_of_birth.trim() === '') {
    throw new ApolloError(
      'Place of birth must be a non-empty string.',
      'INVALID_STRING'
    );
  }

  // *************** Validate postal_code_of_birth
  if (
    typeof postal_code_of_birth !== 'string' ||
    postal_code_of_birth.trim() === ''
  ) {
    throw new ApolloError(
      'Postal code of birth must be a non-empty string.',
      'INVALID_STRING'
    );
  }

  // *************** Validate telephone
  if (typeof tele_phone !== 'string' || tele_phone.trim() === '') {
    throw new ApolloError(
      'Telephone must be a non-empty string.',
      'INVALID_STRING'
    );
  }

  // *************** Validate school_id
  CommonValidator.ValidateObjectId(school_id, 'School ID');
}

// *************** EXPORT MODULE ***************
module.exports = ValidateStudentInput;
