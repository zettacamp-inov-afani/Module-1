const validator = require('validator');
const { ApolloError } = require('apollo-server-express');

const allowedCivilities = ['Mr', 'Mrs'];

/**
 * Validates student input for create or update.
 *
 * @param {Object} input - Student input object.
 * @param {boolean} isUpdate - Whether this is an update operation.
 */
function ValidateStudentInput(input, isUpdate = false) {
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

  if (!isUpdate || civility !== undefined) {
    if (typeof civility !== 'string' || !allowedCivilities.includes(civility)) {
      throw new ApolloError(
        "Civility must be either 'Mr' or 'Mrs'.",
        'INVALID_CIVILITY'
      );
    }
  }

  if (!isUpdate || first_name !== undefined) {
    if (typeof first_name !== 'string' || first_name.trim() === '') {
      throw new ApolloError(
        'First name must be a non-empty string.',
        'INVALID_STRING'
      );
    }
  }

  if (!isUpdate || last_name !== undefined) {
    if (typeof last_name !== 'string' || last_name.trim() === '') {
      throw new ApolloError(
        'Last name must be a non-empty string.',
        'INVALID_STRING'
      );
    }
  }

  if (!isUpdate || email !== undefined) {
    if (typeof email !== 'string' || !validator.isEmail(email)) {
      throw new ApolloError('Email must be valid.', 'INVALID_EMAIL');
    }
  }

  if (!isUpdate || date_of_birth !== undefined) {
    if (!date_of_birth || isNaN(Date.parse(date_of_birth))) {
      throw new ApolloError(
        'Date of birth must be a valid date.',
        'INVALID_DATE'
      );
    }
  }

  if (!isUpdate || place_of_birth !== undefined) {
    if (typeof place_of_birth !== 'string' || place_of_birth.trim() === '') {
      throw new ApolloError(
        'Place of birth must be a non-empty string.',
        'INVALID_STRING'
      );
    }
  }

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

  if (!isUpdate || tele_phone !== undefined) {
    if (typeof tele_phone !== 'string' || tele_phone.trim() === '') {
      throw new ApolloError(
        'Telephone must be a non-empty string.',
        'INVALID_STRING'
      );
    }
  }
}

module.exports = ValidateStudentInput;
