// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');
const { ApolloError } = require('apollo-server-express');

/**
 * Validates whether the provided value is a valid MongoDB ObjectId.
 *
 * @param {string} _id - The ID to validate.
 * @param {string} [fieldName='ID'] - Optional field name for error messages.
 * @throws {Error} If the ID is not a valid MongoDB ObjectId.
 */
function ValidateObjectId(_id, fieldName = 'ID') {
  // *************** Check if the ID is not valid using Mongoose's built-in method
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    throw new ApolloError(
      `${fieldName} is required and must be a valid ObjectId.`,
      'INVALID_OBJECT_ID'
    );
  }
}

/**
 * Validates that the provided value is an array of valid MongoDB ObjectIds.
 *
 * @param {Array<string>} ids - An array of ObjectId strings to validate.
 * @throws {Error} If the input is not an array or contains invalid ObjectIds.
 */
function ValidateMongoObjectIds(ids) {
  // *************** Check if the input is an array
  if (!Array.isArray(ids)) {
    throw new ApolloError('IDs must be an array.', 'INVALID_ID_ARRAY');
  }

  // *************** Loop through each ID to validate individually
  ids.forEach((_id, index) => {
    ValidateObjectId(_id, `ID at index ${index}`);
  });
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateMongoObjectIds,
  ValidateObjectId,
};
