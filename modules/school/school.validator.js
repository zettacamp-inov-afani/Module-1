// *************** IMPORT CORE ***************
const { ApolloError } = require('apollo-server-express');

/**
 * Validates school input data for both create and update operations.
 *
 * @param {Object} input - The input object containing school data.
 * @param {boolean} [updateSchool=false] - If true, allows partial updates (fields can be optional).
 *
 * @throws {ApolloError} If any required field is missing or invalid.
 *
 * This function performs:
 * - Type and structure validation of the input
 * - Validation of `name` object and its fields: `long_name`, `short_name`
 * - Validation of `addresses` array and its fields: `detail`, `city`, `country`, `zipcode`
 *
 * If `isUpdate` is true, the function only validates fields that are present.
 */
function ValidateSchoolInput(input, updateSchool = false) {
  // Validate that the input exists and is an object
  if (!input || typeof input !== 'object') {
    throw new ApolloError(
      'Input must be a valid object.',
      'INVALID_SCHOOL_INPUT'
    );
  }

  const { name, addresses } = input;

  // *************** Validate `name` if it's a create OR explicitly provided during update
  if (!updateSchool || name !== undefined) {
    if (!name || typeof name !== 'object') {
      throw new ApolloError(
        'School name must be an object.',
        'INVALID_SCHOOL_NAME'
      );
    }
  }

  // *************** Validate `long_name` if it's a create OR explicitly present in update input
  if (!updateSchool || 'long_name' in name) {
    if (typeof name.long_name !== 'string' || name.long_name.trim() === '') {
      throw new ApolloError(
        'Long name must be a non empty string.',
        'INVALID_SCHOOL_LONG_NAME'
      );
    }
  }

  // *************** Validate `short_name` if it's a create OR explicitly present in update input
  if (!updateSchool || 'short_name' in name) {
    if (typeof name.short_name !== 'string' || name.short_name.trim() === '') {
      throw new ApolloError(
        'Short name must be a non empty string.',
        'INVALID_SCHOOL_SHORT_NAME'
      );
    }
  }

  // *************** Validate `addresses` if it's a create OR explicitly provided during update
  if (!updateSchool || addresses !== undefined) {
    if (!Array.isArray(addresses)) {
      throw new ApolloError(
        'Addresses must be an array',
        'INVALID_ADDRESS_ARRAY'
      );
    }

    addresses.forEach((address, index) => {
      if (typeof address !== 'object') {
        throw new ApolloError(
          `Address[${index}] must be an object.`,
          'INVALID_ADDRESS_OBJECT'
        );
      }

      // *************** Validate `detail` if it's a create OR present in update
      if (!updateSchool || 'detail' in address) {
        if (
          typeof address.detail !== 'string' ||
          address.detail.trim() === ''
        ) {
          throw new ApolloError(
            `Address[${index}].detail must be a non-empty string.`,
            'INVALID_ADDRESS_DETAIL'
          );
        }
      }

      // *************** Validate `city` if it's a create OR present in update
      if (!updateSchool || 'city' in address) {
        if (typeof address.city !== 'string' || address.city.trim() === '') {
          throw new ApolloError(
            `Address[${index}].city must be a non-empty string.`,
            'INVALID_ADDRESS_CITY'
          );
        }
      }

      // *************** Validate `country` if it's a create OR present in update
      if (!updateSchool || 'country' in address) {
        if (
          typeof address.country !== 'string' ||
          address.country.trim() === ''
        ) {
          throw new ApolloError(
            `Address[${index}].country must be a non-empty string.`,
            'INVALID_ADDRESS_COUNTRY'
          );
        }
      }

      // *************** Validate `zipcode` if it's a create OR present in update
      if (!updateSchool || 'zipcode' in address) {
        if (
          typeof address.zipcode !== 'string' ||
          address.zipcode.trim() === ''
        ) {
          throw new ApolloError(
            `Address[${index}].zipcode must be a non-empty string.`,
            'INVALID_ADDRESS_ZIPCODE'
          );
        }
      }
    });
  }
}

// *************** EXPORT MODULE ***************
module.exports = ValidateSchoolInput;
