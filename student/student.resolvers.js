// *************** IMPORT CORE ***************
const Student = require("./student.model");

// *************** QUERY ***************

/**
 * Retrieves a single student by ID if their status is "is_active".
 *
 * @async
 * @function
 * @param {Object} _ - Unused parent resolver argument.
 * @param {Object} args - Arguments passed to the query.
 * @param {string} args.id - The ID of the student to retrieve.
 * @returns {Promise<Object|null>} The student document if found, otherwise null.
 */
async function GetStudent(_, { id }) {
  return await Student.findOne({ _id: id, status: "is_active" });
}

/**
 * Retrieves all students with status "is_active".
 *
 * @async
 * @function
 * @returns {Promise<Array<Object>>} A list of active student documents.
 */
async function GetAllStudents() {
  return await Student.find({ status: "is_active" });
}

/**
 * Resolves the school associated with a student using DataLoader.
 *
 * This function prevents N+1 problems by batching school lookups.
 *
 * @async
 * @function
 * @param {Object} student - The student object containing the school_id.
 * @param {Object} _ - Unused GraphQL argument.
 * @param {Object} context - The GraphQL context object.
 * @param {Object} context.loaders - Contains all DataLoader instances.
 * @param {DataLoader<string, Object>} context.loaders.schoolById - DataLoader for fetching schools by ID.
 * @returns {Promise<Object|null>} The associated school document, or null if not found.
 */
async function school_id(student, _, { loaders }) {
  return await loaders.schoolById.load(student.school_id.toString());
}

// *************** MUTATION ***************

async function CreateStudent(_, { input }) {
  const student = new Student({
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email,
    school_id: input.school_id,
    status: "is_active",
  });

  return await student.save();
}

async function UpdateStudent(_, { input }) {
  const { id, first_name, last_name, email, date_of_birth, school_id } = input;

  await Student.findOneAndUpdate(
    { _id: id, status: "is_active" },
    {
      first_name,
      last_name,
      email,
      date_of_birth,
      school_id,
    }
  );

  return await Student.findById(id);
}

async function SoftDeleteStudent(_, { id }) {
  await Student.findOneAndUpdate(
    { _id: id, status: "is_active" },
    { status: "deleted" }
  );

  return await Student.findById(id);
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetStudent,
    GetAllStudents,
  },
  Mutation: {
    CreateStudent,
    UpdateStudent,
    SoftDeleteStudent,
  },
  Student: {
    school_id: school_id,
  },
};
