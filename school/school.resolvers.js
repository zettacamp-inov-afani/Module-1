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
  // *************** Validate the input ID
  if (!id) {
    throw new Error("School ID's is required");
  }
  // *************** Find a school with matching ID and active status
  const school = await School.findOne({ _id: id, status: "is_active" });

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
    status: "is_active",
  });

  // *************** Return the list of active schools
  return schools;
}

/**
 * Resolver for the `students` field on the `School` type.
 * Uses DataLoader to fetch a list of students belonging to the given school ID.
 *
 * @async
 * @function ResolveSchoolStudents
 * @param {Object} parent - The parent object, representing a single School.
 * @param {Object} _ - Unused GraphQL arguments placeholder.
 * @param {Object} context - GraphQL context, providing shared resources.
 * @param {Object} context.loaders - Object containing all configured DataLoaders.
 * @param {DataLoader} context.loaders.studentsLoader - DataLoader that batches student lookups by school ID.
 * @returns {Promise<Array<Object>>} A promise resolving to an array of student objects belonging to the school.
 */
async function ResolveSchoolStudents(parent, _, context) {
  // *************** Destructure the studentsLoader from the context
  const { studentsLoader } = context.loaders;

  // *************** If the parent (School) has no _id, return an empty array early
  if (!parent._id) return [];

  // *************** Use the studentsLoader to fetch students by the school's _id
  const studentLoad = await studentsLoader.load(parent._id.toString());
  return studentLoad;
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
  // *************** Create a new school instance with name and address from input
  const school = new School({
    // *************** Set long_name from nested input
    long_name: input.name.long_name,

    // *************** Set short_name from nested input
    short_name: input.name.short_name,

    // *************** Set address array
    address: input.address,

    // *************** Set default status as active
    status: "is_active",
  });

  // *************** Save and return the new school
  const createSchool = await school.save();
  return createSchool;
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

  // *************** Validate required input fields
  if (!id) throw new Error("School ID is required");

  // *************** Update the school document if it's active
  const updatedSchool = await School.findOneAndUpdate(
    // *************** Filter by ID and status
    { _id: id, status: "is_active" },
    {
      // *************** Update long_name
      long_name: name.long_name,

      // *************** Update short_name
      short_name: name.short_name,

      // *************** Update address
      address,
    },

    // *************** Get the newest result
    { new: true }
  );

  // *************** Manually fetch and return the updated document
  return updatedSchool;
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
  // *************** Update school status to "deleted" only if it's currently active
  await School.findOneAndUpdate(
    // *************** Match only active schools
    { _id: id, status: "is_active" },

    // *************** Set status to "deleted"
    { status: "deleted" }
  );

  // *************** Return the updated school document
  const softDeletedSchool = await School.findById(id);
  return softDeletedSchool;
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
  School: {
    students: ResolveSchoolStudents,
  },
};
