// *************** IMPORT CORE ***************
const School = require("./school.model");

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
async function GetSchool(_, { id }) {
  // Find a school with matching ID and active status
  return await School.findOne({ _id: id, status: "is_active" });
}

/**
 * Retrieves all schools whose status is "is_active".
 *
 * @async
 * @function
 * @returns {Promise<Array>} A list of all active schools.
 */
async function GetAllSchools() {
  // Find all schools with status "is_active"
  return await School.find({ status: "is_active" });
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
 * @param {Array} args.input.address - List of address objects.
 * @returns {Promise<Object>} The newly created school document.
 */
async function CreateSchool(_, { input }) {
  // Create a new school instance with name and address from input
  const school = new School({
    // Set long_name from nested input
    long_name: input.name.long_name,

    // Set short_name from nested input
    short_name: input.name.short_name,

    // Set address array
    address: input.address,

    // Set default status as active
    status: "is_active",
  });

  // Save and return the new school
  return await school.save();
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
async function UpdateSchool(_, { input }) {
  const { id, name, address } = input;

  // Update the school document if it's active
  await School.findOneAndUpdate(
    // Filter by ID and status
    { _id: id, status: "is_active" },
    {
      // Update long_name
      long_name: name.long_name,

      // Update short_name
      short_name: name.short_name,

      // Update address
      address,
    }
  );

  // Manually fetch and return the updated document
  return await School.findById(id);
}

/**
 * Performs a soft delete by setting the school's status to "deleted".
 *
 * Only works on schools with "is_active" status.
 *
 * @async
 * @function
 * @param {Object} _ - Unused parent resolver argument.
 * @param {Object} args - Arguments passed to the mutation.
 * @param {string} args.id - ID of the school to soft delete.
 * @returns {Promise<Object|null>} The updated school document after soft deletion.
 */
async function SoftDeleteSchool(_, { id }) {
  // Update school status to "deleted" only if it's currently active
  await School.findOneAndUpdate(
    // Match only active schools
    { _id: id, status: "is_active" },

    // Set status to "deleted"
    { status: "deleted" }
  );

  // Return the updated school document
  return await School.findById(id);
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetSchool,
    GetAllSchools,
  },
  Mutation: {
    CreateSchool,
    UpdateSchool,
    SoftDeleteSchool,
  },
};
