// *************** IMPORT CORE ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const StudentModel = require('./student.model');
const SchoolModel = require('../school/school.model');

// *************** IMPORT VALIDATORS ***************
const StudentValidator = require('./student2.validator');
const CommonValidator = require('../../utilities/validator');
const ValidateStudentInput = require('./student.validator');

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
    // *************** Validate input presence (fail-fast)
    if (!input) {
      throw new ApolloError(error.message || 'Input undefined', 'INPUT_ERROR');
    }

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
    ValidateStudentInput(input);
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
 * Updates a student's data based on the provided input.
 *
 * This function allows dynamic field updates — only fields sent in the input will be updated.
 * It also handles validation, ensures student exists, and updates related school's student reference if needed.
 *
 * @param {Object} parent - GraphQL parent resolver (unused).
 * @param {Object} args - Arguments containing input.
 * @param {Object} args.input - The input object containing fields to update.
 * @returns {Promise<Object>} - The updated student document.
 * @throws {ApolloError} - If validation fails, student not found, or update error occurs.
 */
async function UpdateStudent(parent, { input }) {
  try {
    // *************** Validate input presence (fail-fast)
    if (!input) {
      throw new ApolloError('Input undefined', 'INPUT_ERROR');
    }
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

    // *************** Prepare object for dynamic updates
    const updateFields = {};
    if (civility !== undefined) updateFields.civility = civility;
    if (first_name !== undefined) updateFields.first_name = first_name;
    if (last_name !== undefined) updateFields.last_name = last_name;
    if (email !== undefined) updateFields.email = email;
    if (tele_phone !== undefined) updateFields.tele_phone = tele_phone;
    if (date_of_birth !== undefined) updateFields.date_of_birth = date_of_birth;
    if (place_of_birth !== undefined)
      updateFields.place_of_birth = place_of_birth;
    if (postal_code_of_birth !== undefined)
      updateFields.postal_code_of_birth = postal_code_of_birth;

    // *************** Ensure at least one field is being updated
    if (Object.keys(updateFields).length === 0) {
      throw new ApolloError('No fields to update.', 'EMPTY_UPDATE_INPUT');
    }

    // *************** Validate only provided fields (dynamic)
    ValidateStudentInput(updateFields, true);

    // *************** Keep track of current school for relation update
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

    // *************** Validate school ID if present and assign to updateFields
    if (school_id !== undefined) {
      CommonValidator.ValidateObjectId(school_id, 'School ID');
      updateFields.school_id = school_id;
    }

    // *************** School related update

    // *************** Find and update active student
    const updatedStudent = await StudentModel.findOneAndUpdate(
      { _id: _id, status: 'active' },
      { $set: updateFields },
      { new: true }
    ).lean();

    // *************** Handle case when student not found
    if (!updatedStudent) {
      throw new ApolloError(
        'Student not found or already deleted.',
        'STUDENT_NOT_FOUND'
      );
    }

    // *************** Update school's relation if school_id changed
    const newSchoolId = String(school_id);
    const oldSchoolId = String(existingStudent.school_id);
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
    // *************** Validate input presence (fail-fast)
    if (!id) {
      throw new ApolloError(error.message || 'Input undefined', 'INPUT_ERROR');
    }
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
    throw new ApolloError(
      error.message || 'Failed to delete student.',
      'DELETE_STUDENT_ERROR'
    );
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
async function school_id(parent, args, { loaders }) {
  // *************** sanity check to ensure parent.students is an array with elements before attempting to use DataLoader. If not, return an empty array.
  if (CommonValidator.ValidateObjectId(parent.school_id)) {
    return null;
  }
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
    school_id: school_id,
  },
};
