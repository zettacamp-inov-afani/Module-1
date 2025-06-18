// *************** IMPORT CORE ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const SchoolModel = require('./school.model');

// *************** IMPORT VALIDATORS ***************

const SchoolValidator = require('./school.validator');
const CommonValidator = require('../utilities/validator');

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
    // *************** Validate required input
    SchoolValidator.ValidateSchoolName(input.name);
    SchoolValidator.ValidateSchoolAddresses(input.addresses);

    // *************** Create a new School instance
    const createSchool = SchoolModel.create({
      long_name: input.name.long_name,
      short_name: input.name.short_name,
      addresses: input.addresses,
      status: 'active',
    });

    // *************** Save the school and return the result
    return createSchool;
  } catch (error) {
    throw new ApolloError(
      error.message || 'Failed to create school',
      'CREATE_SCHOOL_ERROR'
    );
  }
}

/**
 * Update an existing school by ID with new name and addresses.
 *
 * @param {Object} parent - Parent resolver (unused).
 * @param {Object} args - Arguments object.
 * @param {Object} args.input - Input data for updating school.
 * @returns {Promise<Object>} The updated school document.
 * @throws {Error} If validation fails or update fails.
 */
async function UpdateSchool(parent, { input }) {
  try {
    const { _id, name, addresses } = input;

    // *************** Validate required input
    CommonValidator.ValidateObjectId(_id, 'School ID');
    SchoolValidator.ValidateSchoolName(name);
    SchoolValidator.ValidateSchoolAddresses(addresses);

    // *************** Update the school data if active
    const updatedSchool = await SchoolModel.findOneAndUpdate(
      { _id: _id, status: 'active' },
      {
        long_name: name.long_name,
        short_name: name.short_name,
        addresses,
      },

      { new: true }
    );

    // *************** Handle case if School not found or already deleted
    if (!updatedSchool) {
      throw new ApolloError(
        'School not found or already deleted.',
        'SCHOOL_NOT_FOUND'
      );
    }
    return updatedSchool;
  } catch (error) {
    throw new ApolloError(
      error.message || 'Failed to update school',
      'UPDATE_SCHOOL_ERROR'
    );
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
    // *************** Validate required input field
    CommonValidator.ValidateObjectId(_id, 'School ID');

    // *************** Find the School with the given ID and "active" status, then update it to "deleted"
    const deletedSchool = await SchoolModel.findByIdAndUpdate(
      { _id: _id, status: 'active' },
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
    throw new ApolloError(
      error.message || 'Failed to delete school',
      'DELETE_SCHOOL_ERROR'
    );
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
  const loadedStudents = loaders.studentById.loadMany(
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
