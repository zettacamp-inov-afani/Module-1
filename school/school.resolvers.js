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
 * Retrieves a single school document by ID, only if its status is "active".
 *
 * @async
 * @function
 * @param {Object} _ - Unused parent resolver argument.
 * @param {Object} args - Arguments passed to the query.
 * @param {string} args.id - The ID of the school to retrieve.
 * @returns {Promise<Object|null>} The school document if found, otherwise null.
 */
async function GetOneSchool(parent, { _id }) {
  // *************** Validate the input ID
  ValidateObjectId(_id, 'School ID');
  // *************** Find a school with matching ID and active status
  const school = await SchoolModel.findOne({ _id: _id, status: 'active' });
  return school;
}

/**
 * Retrieves all schools whose status is "active".
 *
 * @async
 * @function
 * @returns {Promise<Array>} A list of all active schools.
 */
async function GetAllSchools() {
  // *************** Retrieve all school documents with status "active"
  const schools = await SchoolModel.find({
    status: 'active',
  });

  return schools;
}

// *************** MUTATION ***************

/**
 * Creates a new school document in the database with an "active" status.
 *
 * @async
 * @function
 * @param {Object} _ - Unused parent resolver argument.
 * @param {Object} args - Arguments passed to the mutation.
 * @param {Object} args.input - The input object containing school details.
 * @param {Object} args.input.name - Object with long_name and short_name of the school.
 * @param {Array} args.input.addresses - List of address objects.
 * @returns {Promise<Object>} The newly created school document.
 */
async function CreateSchool(parent, { input }) {
  try {
    // *************** Validate all the input fields
    ValidateSchoolName(input.name);
    ValidateSchoolAddresses(input.addresses);

    // *************** Create a new school instance with name and address from input
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
 * Updates a school's name and address if it has "active" status.
 *
 * Does not use `{ new: true }` and instead fetches updated document manually.
 *
 * @async
 * @function
 * @param {Object} _ - Unused parent resolver argument.
 * @param {Object} args - Arguments passed to the mutation.
 * @param {Object} args.input - Input object with ID, name, and address.
 * @returns {Promise<Object|null>} The updated school document or null if not found.
 */
async function UpdateSchool(parent, { input }) {
  try {
    const { _id, name, addresses } = input;

    // *************** Validate all the input fields
    ValidateObjectId(_id, 'School ID');
    ValidateSchoolName(name);
    ValidateSchoolAddresses(addresses);

    // *************** Update the school document if it's active
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
 * Soft deletes a school by setting its status to "deleted",
 * but only if the current status is "active".
 *
 * @async
 * @function DeleteSchool
 * @param {Object} _ - Unused parent resolver argument.
 * @param {Object} args - The arguments passed to the mutation.
 * @param {string} args._id - The ID of the school to soft delete.
 * @returns {Promise<Object>} The updated school document.
 * @throws {Error} If the school is not found or already deleted.
 */
async function DeleteSchool(parent, { _id }) {
  try {
    // *************** Validate school ID
    ValidateObjectId(_id, 'School ID');

    // *************** Find the school with the given ID and "active" status, then update it to "deleted"
    const deletedSchool = await SchoolModel.findByIdAndUpdate(
      { _id: _id, status: 'active' },
      { $set: { status: 'deleted', deleted_at: new Date() } },
      { new: true }
    );
    if (!deletedSchool) {
      throw new Error('School not found or already deleted.');
    }

    // *************** Return the soft-deleted school
    return deletedSchool;
  } catch (error) {
    console.error('DeleteSchool error:', error);
    throw new Error(error.message || 'Failed to delete school.');
  }
}

// *************** LOADERS ***************

/**
 * Resolver for the `students` field on the `School` type.
 * Uses DataLoader to fetch a list of students belonging to the given school ID.
 *
 * @async
 * @function StudetnLoaders
 * @param {Object} parent - The parent object, representing a single School.
 * @param {Object} _ - Unused GraphQL arguments placeholder.
 * @param {Object} context - GraphQL context, providing shared resources.
 * @param {Object} context.loaders - Object containing all configured DataLoaders.
 * @param {DataLoader} context.loaders.studentById - DataLoader that batches student lookups by school ID.
 * @returns {Promise<Array<Object>>} A promise resolving to an array of student objects belonging to the school.
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
