// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const SchoolModel = require('./school.model');

// *************** IMPORT VALIDATORS ***************
const ValidateSchoolInput = require('./school.validator');
const CommonValidator = require('../../utilities/validator');

// *************** QUERY ***************

/**
 * Get one school by ID, only if its status is active.
 *
 * @param {Object} _ - Parent resolver (unused).
 * @param {Object} args - Arguments object containing school ID.
 * @param {string} args._id - The ID of the school to retrieve.
 * @returns {Promise<Object|null>} The found school or null if not found.
 */
async function GetOneSchool(_, { _id }) {
  try {
    // *************** Validate School ID
    CommonValidator.ValidateObjectId(_id, 'School ID');

    // *************** Retrieve school with status 'active'
    const school = await SchoolModel.findById(_id).lean();

    // *************** Handle case if School not found or already deleted
    if (!school) {
      throw new ApolloError(
        'School not found or already deleted.',
        'SCHOOL_NOT_FOUND'
      );
    }
    return school;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * Retrieves all schools with status 'active'.
 *
 * @param {Object} _ - Unused parent argument (GraphQL resolver signature).
 * @param {Object} args - Unused arguments object.
 *
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of active school objects.
 *
 * @throws {ApolloError} If any error occurs while retrieving the schools.
 */
async function GetAllSchools(_, args) {
  try {
    // *************** Retrieve all schools with status 'active'
    const schools = await SchoolModel.find({
      status: 'active',
    }).lean();

    return schools;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

// *************** MUTATION ***************

/**
 * Create a new school entry in the database.
 *
 * @param {object} _ - Unused (parent resolver).
 * @param {object} args
 * @param {object} args.input - School data to create.
 * @returns {Promise<object>} Newly created school document.
 * @throws {ApolloError} If input is invalid or creation fails.
 */
async function CreateSchool(_, { input }) {
  try {
    // *************** Validate required input
    ValidateSchoolInput(input);

    // *************** Destructuring the input
    const { long_name, short_name, addresses } = input;

    // *************** Create a new School instance
    const createSchool = await SchoolModel.create({
      long_name,
      short_name,
      addresses,
      status: 'active',
    });

    // *************** Save the school and return the result
    return createSchool;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * Update school data by ID if it's active.
 *
 * @param {object} _ - Unused (parent resolver).
 * @param {object} args
 * @param {object} args.input - School update data.
 * @returns {Promise<object>} Updated school data.
 * @throws {ApolloError} If input invalid or school not found.
 */
async function UpdateSchool(_, { _id, input }) {
  try {
    // *************** Validate school ID (must be valid MongoDB ObjectId)
    CommonValidator.ValidateObjectId(_id, 'School ID');

    // *************** Validate school input
    ValidateSchoolInput(input);

    // *************** Destructuring the input
    const { long_name, short_name, addresses } = input;

    const updateFields = {
      long_name: long_name.trim(),
      short_name: short_name.trim(),
      addresses,
    };

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
    throw new ApolloError(error.message);
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
async function DeleteSchool(_, { _id }) {
  try {
    // *************** Validate required input field
    CommonValidator.ValidateObjectId(_id, 'School ID');

    // *************** Find the School with the given ID and "active" status, then update it to "deleted"
    const deletedSchool = await SchoolModel.findByIdAndUpdate(_id, {
      $set: { status: 'deleted', deleted_at: new Date() },
    });

    // *************** Handle case if School not found or already deleted
    if (!deletedSchool) {
      throw new ApolloError(
        'School not found or already deleted.',
        'SCHOOL_NOT_FOUND'
      );
    }

    // *************** Return the updated School (now with "deleted" status)
    return _id;
  } catch (error) {
    throw new ApolloError(error.message);
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
  const loadedStudents = await loaders.StudentLoader.loadMany(
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
