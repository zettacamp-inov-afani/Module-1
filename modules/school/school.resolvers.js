// *************** IMPORT CORE ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const SchoolModel = require('./school.model');

// *************** IMPORT VALIDATORS ***************

const SchoolValidator = require('./school.validator');
const CommonValidator = require('../../utilities/validator');

// *************** QUERY ***************

/**
 * Get one school by ID, only if its status is active.
 *
 * @param {Object} parent - Parent resolver (unused).
 * @param {Object} args - Arguments object containing school ID.
 * @param {string} args._id - The ID of the school to retrieve.
 * @returns {Promise<Object|null>} The found school or null if not found.
 */
async function GetOneSchool(parent, { _id }) {
  try {
    // *************** Validate School ID
    CommonValidator.ValidateObjectId(_id, 'School ID');

    // *************** Retrieve school with status 'active'
    const school = await SchoolModel.findOne({
      _id: _id,
      status: 'active',
    }).lean();
    return school;
  } catch (error) {
    throw new ApolloError(
      error.message || 'Failed to retrieve school',
      'GET_ONE_SCHOOL_ERROR'
    );
  }
}

/**
 * Get all schools with status "active".
 *
 * @returns {Promise<Array>} Array of all active schools.
 */
async function GetAllSchools() {
  try {
    // *************** Retrieve all schools with status 'active'
    const schools = await SchoolModel.find({
      status: 'active',
    }).lean();

    return schools;
  } catch (error) {
    throw new ApolloError(
      error.message || 'Failed to retrieve schools',
      'GET_ALL_SCHOOLS_ERROR'
    );
  }
}

// *************** MUTATION ***************

/**
 * Create a new school with validated name and addresses.
 *
 * @param {Object} parent - Parent resolver (unused).
 * @param {Object} args - Arguments object.
 * @param {Object} args.input - Input data for the new school.
 * @returns {Promise<Object>} The created school document.
 * @throws {Error} If validation fails or saving fails.
 */
async function CreateSchool(parent, { input }) {
  try {
    // *************** Fail-fast
    if (!input) {
      throw new ApolloError('Input undefined', 'INPUT_ERROR');
    }
    // *************** Validate required input
    SchoolValidator.ValidateSchoolInput(input);

    // *************** Create a new School instance
    const createSchool = await SchoolModel.create({
      long_name: input.name.long_name,
      short_name: input.name.short_name,
      addresses: input.addresses,
      status: 'active',
    });

    // *************** Save the school and return the result
    return createSchool;
  } catch (error) {
    throw new ApolloError('Failed to create school', 'CREATE_SCHOOL_ERROR');
  }
}

/**
 * Updates a school's data (name and/or addresses) if it is still active.
 *
 * @async
 * @function UpdateSchool
 * @param {Object} parent - Not used, part of GraphQL resolver signature.
 * @param {Object} args.input - The input object for updating school data.
 * @param {string} args.input._id - The ID of the school to update.
 * @param {Object} [args.input.name] - Optional. The new name values.
 * @param {string} [args.input.name.long_name] - Optional. The new long name.
 * @param {string} [args.input.name.short_name] - Optional. The new short name.
 * @param {Array<Object>} [args.input.addresses] - Optional. New address objects to replace old ones.
 * @returns {Promise<Object>} The updated school document.
 * @throws {ApolloError} Throws if validation fails or school is not found or update fails.
 */
async function UpdateSchool(parent, { input }) {
  try {
    // *************** Validate input presence (fail-fast)
    if (!input) {
      throw new ApolloError('Input undefined', 'INPUT_ERROR');
    }
    const { _id, name, addresses } = input;

    // *************** Validate school ID (must be valid MongoDB ObjectId)
    CommonValidator.ValidateObjectId(_id, 'School ID');

    // *************** Initialize fields to be updated
    const updateFields = {};

    // *************** Handle update for name (if provided)
    if (name) {
      // Validate name fields (if any)
      SchoolValidator.ValidateSchoolNameUpdate(name);

      // *************** Set new long_name if present
      if (name.long_name !== undefined) {
        updateFields.long_name = name.long_name.trim();
      }

      // *************** Set new short_name if present
      if (name.short_name !== undefined) {
        updateFields.short_name = name.short_name.trim();
      }
    }

    // *************** Handle update for addresses (if provided)
    if (addresses !== undefined) {
      // *************** Validate the new address array (may be dynamics)
      SchoolValidator.ValidateSchoolAddressesUpdate(addresses);
      // *************** Set new addresses to overwrite old ones
      updateFields.addresses = addresses;
    }

    // *************** Prevent empty update if no valid fields provided
    if (Object.keys(updateFields).length === 0) {
      throw new ApolloError('No fields to update.', 'EMPTY_UPDATE_INPUT');
    }

    // *************** Update the school data if active
    const updatedSchool = await SchoolModel.findOneAndUpdate(
      { _id: _id, status: 'active' },
      { $set: updateFields },
      { new: true }
    ).lean();

    // *************** Handle case if School not found or already deleted
    if (!updatedSchool) {
      throw new ApolloError(
        'School not found or already deleted.',
        'SCHOOL_NOT_FOUND'
      );
    }
    return updatedSchool;
  } catch (error) {
    throw new ApolloError('Failed to update school', 'UPDATE_SCHOOL_ERROR');
  }
}

/**
 * Soft deletes a school by marking its status as "deleted" and setting deleted_at timestamp.
 *
 * @param {Object} parent - Parent resolver (unused).
 * @param {Object} args - Arguments object containing the school ID.
 * @returns {Promise<Object>} The soft-deleted school document.
 * @throws {Error} If validation fails or deletion fails.
 */
async function DeleteSchool(parent, { _id }) {
  try {
    // *************** Validate input presence (fail-fast)
    if (!_id) {
      throw new ApolloError(error.message || 'Input undefined', 'INPUT_ERROR');
    }
    // *************** Validate required input field
    CommonValidator.ValidateObjectId(_id, 'School ID');

    // *************** Find the School with the given ID and "active" status, then update it to "deleted"
    const deletedSchool = await SchoolModel.findByIdAndUpdate(
      { _id: _id },
      { $set: { status: 'deleted', deleted_at: new Date() } },
      { new: true }
    );

    // *************** Handle case if School not found or already deleted
    if (!deletedSchool) {
      throw new ApolloError(
        'School not found or already deleted.',
        'SCHOOL_NOT_FOUND'
      );
    }

    // *************** Return the updated School (now with "deleted" status)
    return deletedSchool;
  } catch (error) {
    throw new ApolloError('Failed to delete school', 'DELETE_SCHOOL_ERROR');
  }
}

// *************** LOADERS ***************

/**
 * DataLoader resolver for loading student documents related to the school.
 *
 * @param {Object} parent - The School parent object that contains `students` field (array of IDs).
 * @param {Object} args - GraphQL arguments (unused).
 * @param {Object} context - GraphQL context containing loaders.
 * @returns {Promise<Array>} Array of loaded student documents.
 */
async function students(parent, args, { loaders }) {
  // *************** sanity check to ensure parent.students is an array with elements before attempting to use DataLoader. If not, return an empty array.
  if (!Array.isArray(parent.students)) {
    return [];
  }

  // *************** Load students via DataLoader
  const loadedStudents = await loaders.studentById.loadMany(
    parent.students.map((id) => String(id))
  );

  return loadedStudents;
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetOneSchool,
    GetAllSchools,
  },
  Mutation: {
    CreateSchool,
    UpdateSchool,
    DeleteSchool,
  },
  School: {
    students: students,
  },
};
