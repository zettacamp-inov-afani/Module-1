// *************** IMPORT CORE ***************
const mongoose = require('mongoose');

// *************** VALIDATION FUNCTIONS ***************

/**
 * Validates that the provided value is an array of valid MongoDB ObjectIds.
 *
 * @param {Array<string>} ids - An array of ObjectId strings to validate.
 * @throws {Error} If the input is not an array or contains invalid ObjectIds.
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

/**
 * Validates a single MongoDB ObjectId.
 *
 * @param {string} _id - The ObjectId to validate.
 * @param {string} [fieldName='ID'] - Optional field name for a custom error message.
 * @throws {Error} If the _id is not a valid ObjectId.
 */
function ValidateObjectId(_id, fieldName = 'ID') {
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    throw new Error(`${fieldName} is required and must be a valid ObjectId.`);
  }
}

/**
 * Validates the structure and content of a school name object.
 *
 * @param {Object} name - The name object containing long_name and short_name.
 * @throws {Error} If the object is missing or contains invalid/empty values.
 */
function ValidateSchoolName(name) {
  if (!name || typeof name !== 'object') {
    throw new Error('School name object is required.');
  }

  if (
    !name.long_name ||
    typeof name.long_name !== 'string' ||
    name.long_name.trim() === ''
  ) {
    throw new Error('Long name is required and must be a non-empty string.');
  }

  if (
    !name.short_name ||
    typeof name.short_name !== 'string' ||
    name.short_name.trim() === ''
  ) {
    throw new Error('Short name is required and must be a non-empty string.');
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
  if (!Array.isArray(addresses) || addresses.length === 0) {
    throw new Error('Address must be a non-empty array.');
  }

  addresses.forEach((address, index) => {
    if (
      !address.detail ||
      typeof address.detail !== 'string' ||
      address.detail.trim() === ''
    ) {
      throw new Error(`Address[${index}]: Detail is required.`);
    }

    if (
      !address.city ||
      typeof address.city !== 'string' ||
      address.city.trim() === ''
    ) {
      throw new Error(`Address[${index}]: City is required.`);
    }

    if (
      !address.country ||
      typeof address.country !== 'string' ||
      address.country.trim() === ''
    ) {
      throw new Error(`Address[${index}]: Country is required.`);
    }

    if (
      address.zipcode === undefined ||
      typeof address.zipcode !== 'number' ||
      !Number.isInteger(address.zipcode)
    ) {
      throw new Error(`Address[${index}]: Zipcode must be an integer.`);
    }
  });
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateMongoObjectIds,
  ValidateObjectId,
  ValidateSchoolName,
  ValidateSchoolAddresses,
};
