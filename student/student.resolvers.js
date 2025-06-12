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
  // *************** Validate the input ID
  if (!id) {
    throw new Error("Student ID is required");
  }
  // *************** Find a student with matching ID and active status
  const student = await Student.findOne({ _id: id, status: "is_active" });

  // *************** Return the found student
  return student;
}

/**
 * Retrieves all students with status "is_active".
 *
 * @async
 * @function
 * @returns {Promise<Array<Object>>} A list of active student documents.
 */
async function GetAllStudents() {
  // *************** Retrieve all student documents with status "is_active"
  const students = await Student.find({
    // *************** Filter by status "is_active" only
    status: "is_active",
  });

  // *************** Return the list of active students
  return students;
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
async function SchoolLoaders(student, _, { loaders }) {
  // *************** Use the DataLoader `schoolById` from context to fetch the related school.
  const schoolLoaders = await loaders.schoolById.load(
    student.school_id.toString()
  );
  return schoolLoaders;
}

// *************** MUTATION ***************

/**
 * Creates a new student document in the database.
 *
 * This function receives the student input from GraphQL arguments, validates the required fields,
 * creates a new Student instance, and stores it in the database with a default status of "is_active".
 *
 * @async
 * @function CreateStudent
 * @param {Object} _ - Unused parent resolver argument (as per GraphQL resolver convention).
 * @param {Object} args - The GraphQL arguments object.
 * @param {Object} args.input - Input object containing student details.
 * @param {string} args.input.civility - Civility or title of the student (e.g., Mr/Ms).
 * @param {string} args.input.first_name - Student's first name.
 * @param {string} args.input.last_name - Student's last name.
 * @param {string} args.input.email - Student's email address.
 * @param {string} args.input.tele_phone - Student's telephone number.
 * @param {string} args.input.date_of_birth - Student's date of birth.
 * @param {string} args.input.place_of_birth - Student's place of birth.
 * @param {string} args.input.postal_code_of_birth - Postal code of student's birthplace.
 * @param {string} args.input.school_id - The ID of the school the student is associated with.
 * @returns {Promise<Object>} The newly created student document.
 * @throws {Error} If any required field is missing.
 */
async function CreateStudent(_, { input }) {
  // *************** Destructing the assignment
  const {
    civility,
    first_name,
    last_name,
    email,
    tele_phone,
    date_of_birth,
    place_of_birth,
    postal_code_of_birth,
    school_id,
  } = input;

  // *************** Validate required fields
  if (
    !civility ||
    !first_name ||
    !last_name ||
    !email ||
    !tele_phone ||
    !place_of_birth ||
    !postal_code_of_birth ||
    !school_id
  ) {
    throw new Error("Missing required fields");
  }
  // *************** Create a new instance of the Student model using input data
  const student = new Student({
    // *************** Assign civility
    civility,

    // *************** Assign first name
    first_name,

    // *************** Assign last name
    last_name,

    // *************** Assign email
    email,

    // *************** Assign telephone
    tele_phone,

    // *************** Assign date of birth
    date_of_birth,

    // *************** Assign place of birth
    place_of_birth,

    // *************** Assign postal code of birth
    postal_code_of_birth,

    // *************** Assign school_id
    school_id,

    // *************** Set status
    status: "is_active",
  });

  // *************** Save the new student to the database and return the result
  const createStudent = await student.save();
  return createStudent;
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
  const {
    id,
    civility,
    first_name,
    last_name,
    email,
    tele_phone,
    date_of_birth,
    place_of_birth,
    postal_code_of_birth,
    school_id,
  } = input;

  // *************** Validate required input fields
  if (!id) throw new Error("Student ID is required");

  // *************** Validate optional input fields
  if (!first_name || !last_name)
    throw new Error("First name and last name must be assigned");

  const updatedStudent = await Student.findOneAndUpdate(
    // *************** Find student by ID and status
    { _id: id, status: "is_active" },
    {
      // *************** Update civility
      civility,

      // *************** Update first name
      first_name,

      // *************** Update last name
      last_name,

      // *************** Update email
      email,

      // *************** Update telephone
      tele_phone,

      // *************** Update date of birth
      date_of_birth,

      // *************** Update place of birth
      place_of_birth,

      // *************** Update postal code of birth
      postal_code_of_birth,

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
  // *************** Validate required input fields
  if (!id) throw new Error("Student ID is required");

  // *************** Find the student with the given ID and "is_active" status, then update it to "deleted"
  const softDeletedStudent = await Student.findOneAndUpdate(
    // *************** Filter by ID and active status
    { _id: id, status: "is_active" },

    // *************** Set status to "deleted" (soft delete)
    { status: "deleted" },
    { new: true }
  );

  // *************** Fetch and return the updated student (now with "deleted" status)
  return softDeletedStudent;
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
    school_id: SchoolLoaders,
  },
};
