// *************** IMPORT CORE ***************
const DataLoader = require('dataloader');

// *************** IMPORT MODULE ***************
const studentModel = require('./student.model');

// *************** IMPORT VALIDATOR ***************
const { ValidateMongoObjectIds } = require('./student.validator');

/**
 * Batch function to load multiple students by their IDs.
 *
 * @param {Array<string>} studentIds - An array of student IDs to fetch.
 * @returns {Promise<Array<Object|null>>} - A promise that resolves to an array of students
 *                                          ordered to match the original input IDs.
 */
function StudentLoaders(studentIds) {
  return new DataLoader(async (studentIds) => {
    // ***************  Validate the incoming schoolIds
    ValidateMongoObjectIds(studentIds);
    const students = await studentModel.find({ _id: { $in: studentIds } });

    const studentMap = {};
    students.forEach((student) => {
      studentMap[student._id.toString()] = student;
    });

    const createStudentLoader = studentIds.map(
      (_id) => studentMap[_id.toString()]
    );
    return createStudentLoader;
  });
}
// *************** EXPORT MODULE ***************
module.exports = StudentLoaders;
