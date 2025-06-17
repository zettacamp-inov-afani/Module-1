// *************** IMPORT CORE ***************
const mongoose = require('mongoose');

// *************** IMPORT MODULE ***************
const SchoolModel = require('./school.model');

// *************** IMPORT VALIDATORS ***************
const {
  ValidateObjectId,
  ValidateSchoolName,
  ValidateSchoolAddresses,
} = require('./school.validator');

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
  ValidateObjectId(_id, 'School ID');

  const school = await SchoolModel.findOne({ _id: _id, status: 'active' });
  return school;
}

/**
 * Get all schools with status "active".
 *
 * @returns {Promise<Array>} Array of all active schools.
 */
async function GetAllSchools() {
  const schools = await SchoolModel.find({
    status: 'active',
  });

  return schools;
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
    ValidateSchoolName(input.name);
    ValidateSchoolAddresses(input.addresses);

    const school = new SchoolModel({
      long_name: input.name.long_name,
      short_name: input.name.short_name,
      addresses: input.addresses,
      status: 'active',
    });

    const createSchool = await school.save();
    return createSchool;
  } catch (error) {
    console.error('CreateSchool error:', error);
    throw new Error(error.message || 'Failed to create school.');
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

    ValidateObjectId(_id, 'School ID');
    ValidateSchoolName(name);
    ValidateSchoolAddresses(addresses);

    const updatedSchool = await SchoolModel.findOneAndUpdate(
      { _id: _id, status: 'active' },
      {
        long_name: name.long_name,
        short_name: name.short_name,
        addresses,
      },

      { new: true }
    );

    if (!updatedSchool) {
      throw new Error('School not found or already deleted.');
    }
    return updatedSchool;
  } catch (error) {
    console.error('UpdateSchool error:', error);
    throw new Error(error.message || 'Failed to update school.');
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
    ValidateObjectId(_id, 'School ID');

    const deletedSchool = await SchoolModel.findByIdAndUpdate(
      { _id: _id, status: 'active' },
      { $set: { status: 'deleted', deleted_at: new Date() } },
      { new: true }
    );
    if (!deletedSchool) {
      throw new Error('School not found or already deleted.');
    }
    return deletedSchool;
  } catch (error) {
    console.error('DeleteSchool error:', error);
    throw new Error(error.message || 'Failed to delete school.');
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
async function StudentLoaders(parent, args, context) {
  const { loaders } = context;
  const studentLoaders = loaders.studentById.loadMany(
    parent.students.map((id) => id.toString())
  );

  return studentLoaders;
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
    students: StudentLoaders,
  },
};
