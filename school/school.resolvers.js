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
  // *************** Validate School ID
  ValidateObjectId(_id, 'School ID');

  // *************** Retrieve school with status 'active'
  const school = await SchoolModel.findOne({ _id: _id, status: 'active' });
  return school;
}

/**
 * Get all schools with status "active".
 *
 * @returns {Promise<Array>} Array of all active schools.
 */
async function GetAllSchools() {
  // *************** Retrieve all schools with status 'active'
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
    // *************** Validate required input
    ValidateSchoolName(input.name);
    ValidateSchoolAddresses(input.addresses);

    // *************** Create a new School instance
    const school = new SchoolModel({
      long_name: input.name.long_name,
      short_name: input.name.short_name,
      addresses: input.addresses,
      status: 'active',
    });

    // *************** Save the school and return the result
    const createSchool = await school.save();
    return createSchool;
  } catch (error) {
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

    // *************** Validate required input
    ValidateObjectId(_id, 'School ID');
    ValidateSchoolName(name);
    ValidateSchoolAddresses(addresses);

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
      throw new Error('School not found or already deleted.');
    }
    return updatedSchool;
  } catch (error) {
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
    // *************** Validate required input field
    ValidateObjectId(_id, 'School ID');

    // *************** Find the School with the given ID and "active" status, then update it to "deleted"
    const deletedSchool = await SchoolModel.findByIdAndUpdate(
      { _id: _id, status: 'active' },
      { $set: { status: 'deleted', deleted_at: new Date() } },
      { new: true }
    );

    // *************** Handle case if School not found or already deleted
    if (!deletedSchool) {
      throw new Error('School not found or already deleted.');
    }

    // *************** Return the updated School (now with "deleted" status)
    return deletedSchool;
  } catch (error) {
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
    parent.students.map((id) => String(id))
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
