// *************** IMPORT CORE ***************
const DataLoader = require('dataloader');

// *************** IMPORT MODULE ***************
const studentModel = require('./student.model');

// *************** IMPORT VALIDATOR ***************
const { ValidateMongoObjectIds } = require('./student.validator');

/**
 * Creates a DataLoader instance for batching and caching student lookups by ID.
 *
 * @param {Array<string>} studentIds - Array of student MongoDB ObjectIds.
 * @returns {DataLoader<string, Object|null>} A DataLoader instance to load students by ID.
 *
 * @throws {Error} If any of the provided IDs are invalid MongoDB ObjectIds.
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
