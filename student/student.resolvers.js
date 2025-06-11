// *************** IMPORT MODULE ***************
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
  // *************** Find a school with matching ID and active status
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
  // *************** Find all students with status "is_active"
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

/**
 * Creates a new student and saves it to the database with "is_active" status.
 *
 * @async
 * @function
 * @param {Object} _ - Unused parent resolver argument.
 * @param {Object} args - Arguments containing the input for student creation.
 * @param {Object} args.input - The input object for student data.
 * @param {string} args.input.first_name - The first name of the student.
 * @param {string} args.input.last_name - The last name of the student.
 * @param {string} args.input.email - The email address of the student.
 * @param {string} [args.input.date_of_birth] - The optional date of birth.
 * @param {string} args.input.school_id - The ID of the school the student belongs to.
 * @returns {Promise<Object>} The newly created student document.
 */
async function CreateStudent(_, { input }) {
  // *************** Create a new instance of the Student model using input data
  const student = new Student({
    // *************** Assign first name
    first_name: input.first_name,

    // *************** Assign last name
    last_name: input.last_name,

    // *************** Assign email
    email: input.email,

    // *************** Assign school_id
    school_id: input.school_id,

    // *************** Set status
    status: "is_active",
  });

  // *************** Save the new student to the database and return the result
  return await student.save();
}

/**
 * Updates an existing student if they are active.
 *
 * Finds the student by ID and updates their data without using `{ new: true }`.
 * Then refetches and returns the updated student document.
 *
 * @async
 * @function
 * @param {Object} _ - Unused parent resolver argument.
 * @param {Object} args - Arguments containing the input for updating student.
 * @param {Object} args.input - The input object with updated student fields.
 * @param {string} args.input.id - The ID of the student to update.
 * @param {string} args.input.first_name - Updated first name.
 * @param {string} args.input.last_name - Updated last name.
 * @param {string} [args.input.email] - Optional updated email.
 * @param {string} [args.input.date_of_birth] - Optional updated date of birth.
 * @param {string} args.input.school_id - Updated school ID.
 * @returns {Promise<Object|null>} The updated student document, or null if not found.
 */
async function UpdateStudent(_, { input }) {
  // *************** Destructure all the input fields
  const { id, first_name, last_name, email, date_of_birth, school_id } = input;

  // *************** Validate required input fields
  if (!id) throw new Error("Student ID is required");
  if (!first_name || !last_name)
    throw new Error("First name and last name are required");
  if (!school_id) throw new Error("School ID is required");

  const updatedStudent = await Student.findOneAndUpdate(
    // *************** Find student by ID and status
    { _id: id, status: "is_active" },
    {
      // *************** Update first name
      first_name,

      // *************** Update last name
      last_name,

      // *************** Update email
      email,

      // *************** Update date of birth
      date_of_birth,

      // *************** Update school_id
      school_id,
    },

    // *************** Get the newest result
    { new: true }
  );

  // *************** Return the updated student
  return updatedStudent;
}

/**
 * Soft deletes a student by setting their status to "deleted".
 *
 * Only affects students whose status is currently "is_active".
 * After update, fetches and returns the updated student.
 *
 * @async
 * @function
 * @param {Object} _ - Unused parent resolver argument.
 * @param {Object} args - Arguments for the mutation.
 * @param {string} args.id - The ID of the student to soft delete.
 * @returns {Promise<Object|null>} The soft-deleted student document, or null if not found.
 */
async function SoftDeleteStudent(_, { id }) {
  // *************** Find the student with the given ID and "is_active" status, then update it to "deleted"
  await Student.findOneAndUpdate(
    // *************** Filter by ID and active status
    { _id: id, status: "is_active" },

    // *************** Set status to "deleted" (soft delete)
    { status: "deleted" }
  );

  // *************** Fetch and return the updated student (now with "deleted" status)
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
