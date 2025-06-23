// *************** IMPORT CORE ***************
const { ApolloError } = require('apollo-server-express');

/**
 * Validates school input data for both create and update operations (strict mode).
 *
 * @param {Object} input - The input object containing school data.
 *
 * @throws {ApolloError} If any required field is missing or invalid.
 */
function ValidateSchoolInput(input) {
  // *************** Validate that the input exists and is an object
  if (!input || typeof input !== 'object') {
    throw new ApolloError(
      'Input must be a valid object.',
      'INVALID_SCHOOL_INPUT'
    );
  }

  const { long_name, short_name, addresses } = input;

  // *************** Validate long_name
  if (typeof long_name !== 'string' || long_name.trim() === '') {
    throw new ApolloError(
      'Long name must be a non-empty string.',
      'INVALID_SCHOOL_LONG_NAME'
    );
  }

  // *************** Validate short_name
  if (typeof short_name !== 'string' || short_name.trim() === '') {
    throw new ApolloError(
      'Short name must be a non-empty string.',
      'INVALID_SCHOOL_SHORT_NAME'
    );
  }

  // *************** Validate addresses

  // *************** Validate that the addresses input is an array
  if (!Array.isArray(addresses)) {
    throw new ApolloError(
      'Addresses must be an array.',
      'INVALID_ADDRESS_ARRAY'
    );
  }

  addresses.forEach((address, index) => {
    // *************** Validate that the input exists and is an object
    if (typeof address !== 'object' || address === null) {
      throw new ApolloError(
        `Address[${index}] must be an object.`,
        'INVALID_ADDRESS_OBJECT'
      );
    }

    // *************** Validate addresess's detail
    if (typeof address.detail !== 'string' || address.detail.trim() === '') {
      throw new ApolloError(
        `Address[${index}].detail must be a non-empty string.`,
        'INVALID_ADDRESS_DETAIL'
      );
    }

    // *************** Validate addresess's city
    if (typeof address.city !== 'string' || address.city.trim() === '') {
      throw new ApolloError(
        `Address[${index}].city must be a non-empty string.`,
        'INVALID_ADDRESS_CITY'
      );
    }

    // *************** Validate addresess's country
    if (typeof address.country !== 'string' || address.country.trim() === '') {
      throw new ApolloError(
        `Address[${index}].country must be a non-empty string.`,
        'INVALID_ADDRESS_COUNTRY'
      );
    }

    // *************** Validate addresess's zipcode
    if (typeof address.zipcode !== 'string' || address.zipcode.trim() === '') {
      throw new ApolloError(
        `Address[${index}].zipcode must be a non-empty string.`,
        'INVALID_ADDRESS_ZIPCODE'
      );
    }
  });
}

// *************** EXPORT MODULE ***************
module.exports = ValidateSchoolInput;
