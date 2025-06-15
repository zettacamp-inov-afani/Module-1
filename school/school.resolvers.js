// *************** IMPORT MODULE ***************
const School = require('./school.model');

// *************** QUERY ***************

/**
 * Retrieves a single school document by ID, only if its status is "is_active".
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
  if (!_id) {
    throw new Error("School ID's is required");
  }
  // *************** Find a school with matching ID and active status
  const school = await School.findOne({ _id: _id, status: 'is_active' });

  // *************** Return the found student
  return school;
}

/**
 * Retrieves all schools whose status is "is_active".
 *
 * @async
 * @function
 * @returns {Promise<Array>} A list of all active schools.
 */
async function GetAllSchools() {
  // *************** Retrieve all school documents with status "is_active"
  const schools = await School.find({
    // *************** Filter by status "is_active" only
    status: 'is_active',
  });

  // *************** Return the list of active schools
  return schools;
}

// *************** MUTATION ***************

/**
 * Creates a new school document in the database with an "is_active" status.
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
    // *************** Validate input.name
    if (!input.name) {
      throw new Error('School name object is required.');
    }

    // *************** Validate long_name
    if (
      !input.name.long_name ||
      typeof input.name.long_name !== 'string' ||
      input.name.long_name.trim() === ''
    ) {
      throw new Error('Long name is required and must be a non-empty string.');
    }

    // *************** Validate short_name
    if (
      !input.name.short_name ||
      typeof input.name.short_name !== 'string' ||
      input.name.short_name.trim() === ''
    ) {
      throw new Error('Short name is required and must be a non-empty string.');
    }

    // *************** Validate address array
    if (!Array.isArray(input.addresses) || !input.addresses.length) {
      throw new Error('Address must be a non-empty array.');
    }

    // *************** Validate each address object inside the array
    input.addresses.forEach((address, addressIndex) => {
      if (
        !address.detail ||
        typeof address.detail !== 'string' ||
        address.detail.trim() === ''
      ) {
        throw new Error(`Address[${addressIndex}]: Detail is required.`);
      }

      if (
        !address.city ||
        typeof address.city !== 'string' ||
        address.city.trim() === ''
      ) {
        throw new Error(`Address[${addressIndex}]: City is required.`);
      }

      if (
        !address.country ||
        typeof address.country !== 'string' ||
        address.country.trim() === ''
      ) {
        throw new Error(`Address[${addressIndex}]: Country is required.`);
      }

      if (
        address.zipcode === undefined ||
        typeof address.zipcode !== 'number' ||
        !Number.isInteger(address.zipcode)
      ) {
        throw new Error(
          `Address[${addressIndex}]: Zipcode must be an integer.`
        );
      }
    });

    // *************** Create a new school instance with name and address from input
    const school = new School({
      // *************** Set long_name from nested input
      long_name: input.name.long_name,

      // *************** Set short_name from nested input
      short_name: input.name.short_name,

      // *************** Set address array
      addresses: input.addresses,

      // *************** Set default status as active
      status: 'is_active',
    });

    // *************** Save and return the new school
    const createSchool = await school.save();
    return createSchool;
  } catch (error) {
    console.error('CreateSchool error:', error);
    throw new Error(error.message || 'Failed to create school.');
  }
}

/**
 * Updates a school's name and address if it has "is_active" status.
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

    // *************** Validate school ID
    if (!_id || typeof _id !== 'string' || _id.trim() === '') {
      throw new Error('School ID is required and must be a non-empty string.');
    }

    // *************** Validate name object
    if (!name || typeof name !== 'object') {
      throw new Error('School name object is required.');
    }

    // *************** Validate long_name
    if (
      !name.long_name ||
      typeof name.long_name !== 'string' ||
      name.long_name.trim() === ''
    ) {
      throw new Error('Long name is required and must be a non-empty string.');
    }

    // *************** Validate short_name
    if (
      !name.short_name ||
      typeof name.short_name !== 'string' ||
      name.short_name.trim() === ''
    ) {
      throw new Error('Short name is required and must be a non-empty string.');
    }

    // *************** Validate address array
    if (!Array.isArray(addresses) || !addresses.length) {
      throw new Error('Address must be a non-empty array.');
    }

    // *************** Validate each address object
    addresses.forEach((address, addressIndex) => {
      if (
        !address.detail ||
        typeof address.detail !== 'string' ||
        address.detail.trim() === ''
      ) {
        throw new Error(`Address[${addressIndex}]: Detail is required.`);
      }

      if (
        !address.city ||
        typeof address.city !== 'string' ||
        address.city.trim() === ''
      ) {
        throw new Error(`Address[${addressIndex}]: City is required.`);
      }

      if (
        !address.country ||
        typeof address.country !== 'string' ||
        address.country.trim() === ''
      ) {
        throw new Error(`Address[${addressIndex}]: Country is required.`);
      }

      if (
        address.zipcode === undefined ||
        typeof address.zipcode !== 'number' ||
        !Number.isInteger(address.zipcode)
      ) {
        throw new Error(
          `Address[${addressIndex}]: Zipcode must be an integer.`
        );
      }
    });

    // *************** Update the school document if it's active
    const updatedSchool = await School.findOneAndUpdate(
      // *************** Filter by ID and status
      { _id: _id, status: 'is_active' },
      {
        // *************** Update long_name
        long_name: name.long_name,

        // *************** Update short_name
        short_name: name.short_name,

        // *************** Update address
        addresses,
      },
      // *************** Get the newest result
      { new: true }
    );

    // *************** Check if school was found
    if (!updatedSchool) {
      throw new Error('School not found or already deleted.');
    }

    // *************** Return the updated school
    return updatedSchool;
  } catch (error) {
    console.error('UpdateSchool error:', error);
    throw new Error(error.message || 'Failed to update school.');
  }
}

/**
 * Soft deletes a school by setting its status to "deleted",
 * but only if the current status is "is_active".
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
    if (!_id || typeof _id !== 'string' || _id.trim() === '') {
      throw new Error('School ID is required and must be a non-empty string.');
    }

    // *************** Find the school with the given ID and "is_active" status, then update it to "deleted"
    const softDeletedSchool = await School.findOneAndUpdate(
      // *************** Filter by ID and active status
      { _id: _id, status: 'is_active' },

      // *************** Set status to "deleted" (soft delete)
      { status: 'deleted' },

      // *************** Return the updated document
      { new: true }
    );

    // *************** Handle not found or already deleted
    if (!softDeletedSchool) {
      throw new Error('School not found or already deleted.');
    }

    // *************** Return the soft-deleted school
    return softDeletedSchool;
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
