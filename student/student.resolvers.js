// *************** IMPORT CORE ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const StudentModel = require('./student.model');
const SchoolModel = require('../school/school.model');

// *************** IMPORT VALIDATORS ***************
const StudentValidator = require('./student.validator');
const CommonValidator = require('../utilities/validator');

// *************** QUERY ***************

/**
 * Retrieves a single student by ID if their status is "active".
 *
 * @async
 * @function
 * @param {Object} _ - Unused parent resolver argument.
 * @param {Object} args - Arguments passed to the query.
 * @param {string} args.id - The ID of the student to retrieve.
 * @returns {Promise<Object|null>} The student document if found, otherwise null.
 */
async function GetOneStudent(parent, { _id }) {
  try {
    // *************** Validate the input ID
    CommonValidator.ValidateObjectId(_id, 'Student ID');

    // *************** Find student by ID and check if status is active
    const student = await StudentModel.findOne({
      _id: _id,
      status: 'active',
    }).lean();

    // *************** Return student document or null if not found
    return student;
  } catch (error) {
    throw new ApolloError(
      error.message || 'Failed to get student.',
      'GET_ONE_STUDENT_ERROR'
    );
  }
}

/**
 * Retrieves all students with status "active".
 *
 * @async
 * @function
 * @returns {Promise<Array<Object>>} A list of active student documents.
 */
async function GetAllStudents() {
  try {
    // *************** Retrieve all student documents with status "active"
    const students = await StudentModel.find({
      status: 'active',
    }).lean();

    // *************** Return list of students
    return students;
  } catch (error) {
    throw new ApolloError(
      error.message || 'Failed to get all students.',
      'GET_ALL_STUDENTS_ERROR'
    );
  }
}

// *************** MUTATION ***************

/**
 * Creates a new student document in the database.
 *
 * This function receives the student input from GraphQL arguments, validates the required fields,
 * creates a new Student instance, and stores it in the database with a default status of "active".
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
async function CreateStudent(parent, { input }) {
  try {
    const allowedCivilities = ['Mr', 'Mrs'];

    // *************** Destructure input fields
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

    // *************** Validation input
    StudentValidator.ValidateStudentInput({
      civility,
      first_name,
      last_name,
      email,
      tele_phone,
      date_of_birth,
      place_of_birth,
      postal_code_of_birth,
    });
    CommonValidator.ValidateObjectId(school_id, 'School ID');

    // *************** Create and save student to DB
    const createStudent = await StudentModel.create({
      civility,
      first_name,
      last_name,
      email,
      tele_phone,
      date_of_birth,
      place_of_birth,
      postal_code_of_birth,
      school_id,
      status: 'active',
    });

    // *************** Add student ID to associated school
    await SchoolModel.updateOne(
      { _id: school_id },
      { $push: { students: createStudent._id } }
    );

    // *************** Return newly created student
    return createStudent;
  } catch (error) {
    // *************** Throw error if something went wrong
    throw new ApolloError(
      error.message || 'Failed to create student.',
      'CREATE_STUDENT_ERROR'
    );
  }
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
async function UpdateStudent(parent, { input }) {
  try {
    const allowedCivilities = ['Mr', 'Mrs'];

    // *************** Destructure input fields
    const {
      _id,
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

    // *************** Validate all input
    CommonValidator.ValidateObjectId(_id, 'Student ID');
    StudentValidator.ValidateCivility(civility);
    StudentValidator.ValidateNonEmptyString(first_name, 'First name');
    StudentValidator.ValidateNonEmptyString(last_name, 'Last name');
    StudentValidator.ValidateEmail(email);
    StudentValidator.ValidateNonEmptyString(tele_phone, 'Telephone');
    StudentValidator.ValidateDate(date_of_birth, 'Date of birth');
    StudentValidator.ValidateNonEmptyString(place_of_birth, 'Place of birth');
    StudentValidator.ValidateNonEmptyString(
      postal_code_of_birth,
      'Postal code of birth'
    );
    CommonValidator.ValidateObjectId(school_id, 'School ID');

    // *************** Find student before update (get from old school_id)
    const existingStudent = await StudentModel.findOne({
      _id,
      status: 'active',
    });
    if (!existingStudent) {
      throw new ApolloError(
        'Student not found or already deleted.',
        'STUDENT_NOT_FOUND'
      );
    }

    // *************** Prepare the existing old school_id
    const oldSchoolId = String(existingStudent.school_id);

    // *************** Find and update active student
    const updatedStudent = await StudentModel.findOneAndUpdate(
      { _id: _id, status: 'active' },
      {
        civility,
        first_name,
        last_name,
        email,
        tele_phone,
        date_of_birth,
        place_of_birth,
        postal_code_of_birth,
        school_id,
      },
      { new: true }
    );

    // *************** Handle case when student not found
    if (!updatedStudent) {
      throw new ApolloError(
        'Student not found or already deleted.',
        'STUDENT_NOT_FOUND'
      );
    }

    // *************** Update school's relation if school_id changed
    const newSchoolId = String(school_id);
    if (oldSchoolId !== newSchoolId) {
      // *************** Delete from old school
      await SchoolModel.updateOne(
        { _id: oldSchoolId },
        { $pull: { students: _id } }
      );

      // *************** Add the new school
      await SchoolModel.updateOne(
        { _id: newSchoolId },
        { $addToSet: { students: _id } }
      );
    }

    // *************** Return updated student
    return updatedStudent;
  } catch (error) {
    // *************** Throw update error
    throw new ApolloError(
      error.message || 'Failed to update student.',
      'UPDATE_STUDENT_ERROR'
    );
  }
}

/**
 * Soft deletes a student by setting their status to "deleted".
 *
 * Only affects students whose status is currently "active".
 * After update, fetches and returns the updated student.
 *
 * @async
 * @function
 * @param {Object} _ - Unused parent resolver argument.
 * @param {Object} args - Arguments for the mutation.
 * @param {string} args.id - The ID of the student to soft delete.
 * @returns {Promise<Object|null>} The soft-deleted student document, or null if not found.
 */
async function DeleteStudent(parent, { _id }) {
  try {
    // *************** Validate required input field
    CommonValidator.ValidateObjectId(_id, 'Student ID');

    // *************** Find and update student status to deleted
    const deletedStudent = await StudentModel.findByIdAndUpdate(
      { _id: _id, status: 'active' },
      { $set: { status: 'deleted', deleted_at: new Date() } },
      { new: true }
    );

    // *************** Handle if student not found
    if (!deletedStudent) {
      throw new ApolloError(
        error.message || 'Failed to delete student.',
        'DELETE_STUDENT_ERROR'
      );
    }

    // *************** Return soft-deleted student
    return deletedStudent;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete student.');
  }
}

// *************** LOADERS ***************

/**
 * Resolves the school associated with a student using DataLoader.
 *
 * This function prevents N+1 problems by batching school lookups.
 *
 * @async
 * @function SchoolLoaders
 * @param {Object} student - The student object containing the school_id.
 * @param {Object} _ - Unused GraphQL argument.
 * @param {Object} context - The GraphQL context object.
 * @param {Object} context.loaders - Contains all DataLoader instances.
 * @param {DataLoader<string, Object>} context.loaders.schoolById - DataLoader for fetching schools by ID.
 * @returns {Promise<Object|null>} The associated school document, or null if not found.
 */
async function SchoolLoaders(parent, args, { loaders }) {
  // *************** Use the DataLoader `schoolById` from context to fetch the related school.
  const loadedSchools = await loaders.schoolById.load(String(parent.school_id));

  // *************** Return associated school
  return loadedSchools;
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetOneStudent,
    GetAllStudents,
  },
  Mutation: {
    CreateStudent,
    UpdateStudent,
    DeleteStudent,
  },
  Student: {
    school_id: SchoolLoaders,
  },
};
