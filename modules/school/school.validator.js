// *************** IMPORT CORE ***************
const { ApolloError } = require('apollo-server-express');

/**
 * Validates the structure and content of a school name object.
 *
 * @param {Object} name - The name object containing long_name and short_name.
 * @throws {Error} If the object is missing or contains invalid/empty values.
 */
function ValidateSchoolName(name) {
  // *************** Check if name is an object
  if (!name || typeof name !== 'object') {
    throw new ApolloError(
      'School name object is required.',
      'INVALID_SCHOOL_NAME'
    );
  }

  // *************** Validate long_name
  if (
    !name.long_name ||
    typeof name.long_name !== 'string' ||
    name.long_name.trim() === ''
  ) {
    throw new ApolloError(
      'Long name is required and must be a non-empty string.',
      'INVALID_SCHOOL_LONG_NAME'
    );
  }

  // *************** Validate short_name
  if (
    !name.short_name ||
    typeof name.short_name !== 'string' ||
    name.short_name.trim() === ''
  ) {
    throw new ApolloError(
      'Short name is required and must be a non-empty string.',
      'INVALID_SCHOOL_SHORT_NAME'
    );
  }
}

/**
 * Validates an array of school address objects.
 *
 * @param {Array<Object>} addresses - An array of address objects.
 * @throws {Error} If the array is empty or any required field is missing/invalid.
 */
function ValidateSchoolAddresses(addresses) {
  // *************** Validate each address object inside the array
  if (!Array.isArray(addresses) || !addresses.length) {
    throw new ApolloError(
      'Address must be a non-empty array.',
      'INVALID_ADDRESS_ARRAY'
    );
  }

  // *************** Loop through each address object
  addresses.forEach((address, index) => {
    if (
      // *************** Validate detail
      !address.detail ||
      typeof address.detail !== 'string' ||
      address.detail.trim() === ''
    ) {
      throw new ApolloError(
        `Address[${index}]: Detail is required.`,
        'INVALID_ADDRESS_DETAIL'
      );
    }

    // *************** Validate city
    if (
      !address.city ||
      typeof address.city !== 'string' ||
      address.city.trim() === ''
    ) {
      throw new ApolloError(
        `Address[${index}]: City is required.`,
        'INVALID_ADDRESS_CITY'
      );
    }

    // *************** Validate country
    if (
      !address.country ||
      typeof address.country !== 'string' ||
      address.country.trim() === ''
    ) {
      throw new ApolloError(
        `Address[${index}]: Country is required.`,
        'INVALID_ADDRESS_COUNTRY'
      );
    }

    // *************** Validate zipcode
    if (
      !address.zipcode ||
      typeof address.zipcode !== 'string' ||
      address.zipcode.trim() === ''
    ) {
      throw new ApolloError(
        `Address[${index}]: Zipcode is required.`,
        'INVALID_ADDRESS_ZIPCODE'
      );
    }
  });
}

/**
 * Validates a dynamic school name input.
 * Only validates fields that are present (e.g., long_name, short_name).
 *
 * @param {Object} name - The name object containing school name fields.
 * @param {string} [name.long_name] - Optional long name of the school.
 * @param {string} [name.short_name] - Optional short name of the school.
 * @throws {ApolloError} If the input is not an object or if provided fields are invalid.
 */
function ValidateSchoolNameUpdate(name) {
  if (!name || typeof name !== 'object') {
    throw new ApolloError(
      'School name must be an object.',
      'INVALID_SCHOOL_NAME'
    );
  }

  // Check if name object is empty (no fields provided)
  if (!Object.keys(name).length) {
    throw new ApolloError(
      'School name must contain at least one field to update.',
      'EMPTY_SCHOOL_NAME_UPDATE'
    );
  }

  if ('long_name' in name) {
    if (typeof name.long_name !== 'string' || name.long_name.trim() === '') {
      throw new ApolloError(
        'Long name must be a non-empty string.',
        'INVALID_SCHOOL_LONG_NAME'
      );
    }
  }

  if ('short_name' in name) {
    if (typeof name.short_name !== 'string' || name.short_name.trim() === '') {
      throw new ApolloError(
        'Short name must be a non-empty string.',
        'INVALID_SCHOOL_SHORT_NAME'
      );
    }
  }
}

/**
 * Validates a dynamic list of school addresses.
 * Each address must include valid non-empty `detail`, `city`, `country`, and `zipcode` fields.
 *
 * @param {Array<Object>} addresses - Array of address objects to validate.
 * @param {string} addresses[].detail - Address detail (e.g., street).
 * @param {string} addresses[].city - City name.
 * @param {string} addresses[].country - Country name.
 * @param {string} addresses[].zipcode - Postal code.
 * @throws {ApolloError} If the array is empty or any field in an address is invalid.
 */
function ValidateSchoolAddressesUpdate(addresses) {
  if (!Array.isArray(addresses)) {
    throw new ApolloError(
      'Addresses must be an array.',
      'INVALID_ADDRESS_ARRAY'
    );
  }

  addresses.forEach((address, index) => {
    if (typeof address !== 'object' || address === null) {
      throw new ApolloError(
        `Address[${index}] must be an object.`,
        'INVALID_ADDRESS_OBJECT'
      );
    }

    if (
      'detail' in address &&
      (typeof address.detail !== 'string' || address.detail.trim() === '')
    ) {
      throw new ApolloError(
        `Address[${index}].detail must be a non-empty string if provided.`,
        'INVALID_ADDRESS_DETAIL'
      );
    }

    if (
      'city' in address &&
      (typeof address.city !== 'string' || address.city.trim() === '')
    ) {
      throw new ApolloError(
        `Address[${index}].city must be a non-empty string if provided.`,
        'INVALID_ADDRESS_CITY'
      );
    }

    if (
      'country' in address &&
      (typeof address.country !== 'string' || address.country.trim() === '')
    ) {
      throw new ApolloError(
        `Address[${index}].country must be a non-empty string if provided.`,
        'INVALID_ADDRESS_COUNTRY'
      );
    }

    if (
      'zipcode' in address &&
      (typeof address.zipcode !== 'string' || address.zipcode.trim() === '')
    ) {
      throw new ApolloError(
        `Address[${index}].zipcode must be a non-empty string if provided.`,
        'INVALID_ADDRESS_ZIPCODE'
      );
    }
  });
}

/**
 * Validates the structure and presence of the input object for creating or updating a School.
 *
 * This is a fail-fast validator that ensures:
 * - The input object is defined
 * - The 'name' field passes school name validation
 * - The 'addresses' field passes address array validation
 *
 * @function
 * @param {Object} input - The input object representing school data.
 * @param {string} input.name - The name of the school.
 * @param {Array<Object>} input.addresses - An array of address objects for the school.
 *
 * @throws {ApolloError} Throws an INPUT_ERROR if the input is missing or fails validation.
 */
function ValidateSchoolInput(input) {
  // *************** Validate input presence (fail-fast)
  if (!input) {
    throw new ApolloError(error.message || 'Input undefined', 'INPUT_ERROR');
  }
  const { name, addresses } = input;

  ValidateSchoolName(name);
  ValidateSchoolAddresses(addresses);
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateSchoolName,
  ValidateSchoolAddresses,
  ValidateSchoolNameUpdate,
  ValidateSchoolAddressesUpdate,
  ValidateSchoolInput,
};
