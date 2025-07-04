// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const SubjectModel = require('./subject.model');

// *************** IMPORT VALIDATORS ***************
const ValidateBlockInput = require('./subject.validator');
const CommonValidator = require('../../utilities/validator');
const { Query } = require('mongoose');

// *************** QUERY ***************

/**
 * Retrieves a single active subject by its ID.
 *
 * @async
 * @function GetOneSubject
 * @param {Object} _ - Unused parent resolver argument (ignored).
 * @param {Object} args - The arguments object.
 * @param {string} args._id - The ID of the subject to retrieve.
 * @returns {Promise<Object>} The subject document if found and active.
 * @throws {ApolloError} Throws an error if the ID is invalid, subject is not found,
 *                       or another error occurs during retrieval.
 */
async function GetOneSubject(_, { _id }) {
  try {
    // *************** Validate Subject ID
    CommonValidator.ValidateObjectId(_id, 'Subject ID');

    // *************** Find subject by ID and check if status is active
    const subject = await SubjectModel.findOne({
      _id: _id,
      status: 'active',
    }).lean();

    // *************** Handle case if Subject not found or already deleted
    if (!subject) {
      throw new ApolloError(
        'Block not found or already deleted.',
        'BLOCK_NOT_FOUND'
      );
    }

    // *************** Return the result
    return subject;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * Retrieves all subjects with the status 'active'.
 *
 * @async
 * @function GetAllSubjects
 * @param {Object} _ - Unused parent resolver argument (ignored).
 * @param {Object} args - GraphQL arguments (currently unused).
 * @returns {Promise<Object[]>} A list of active subject documents.
 * @throws {ApolloError} Throws an error if retrieval fails.
 *
 */
async function GetAllSubjects(_, args) {
  try {
    // *************** Retrieve all subjects with status 'active'
    const subjects = await SubjectModel.find({
      status: 'active',
    }).lean();

    // *************** return the result
    return subjects;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetOneSubject,
    GetAllSubjects,
  },
};
