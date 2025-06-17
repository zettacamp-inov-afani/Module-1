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

    // *************** Find all Schools whose id is in the schoolIds array
    const students = await studentModel.find({ _id: { $in: studentIds } });

    // *************** Create schoolMap object for dictionary
    const studentMap = {};
    students.forEach((student) => {
      studentMap[String(student._id)] = student;
    });

    // *************** Return an array containing schools in the order of the requested schoolIds.
    const createStudentLoader = studentIds.map(
      (_id) => studentMap[String(_id)]
    );
    return createStudentLoader;
  });
}
// *************** EXPORT MODULE ***************
module.exports = StudentLoaders;
