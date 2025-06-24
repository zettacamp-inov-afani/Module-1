// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');

// *************** IMPORT MODULE ***************
const StudentModel = require('./student.model');

// *************** IMPORT VALIDATOR ***************
const CommonValidator = require('../../utilities/validator');

/**
 * Creates a DataLoader instance to batch and cache student retrievals by ID.
 *
 * This function returns a new DataLoader that:
 * - Validates incoming student IDs.
 * - Fetches all matching student documents from the database.
 * - Maps them by ID for efficient lookup.
 * - Returns students in the same order as requested IDs.
 *
 * Used to prevent N+1 query problems in GraphQL resolvers when resolving related student data.
 *
 * @function StudentLoader
 * @returns {DataLoader<string, Object>} A DataLoader instance that loads students by their ObjectId.
 */
function StudentLoader() {
  // *************** Create new instance of DataLoader
  return new DataLoader(async (studentIds) => {
    // ***************  Validate the incoming schoolIds
    CommonValidator.ValidateMongoObjectIds(studentIds);

    // *************** Find all Schools whose id is in the schoolIds array
    const students = await StudentModel.find({
      _id: { $in: studentIds },
    }).lean();

    // *************** Create schoolMap object for dictionary
    const studentMap = {};
    students.forEach((student) => {
      studentMap[String(student._id)] = student;
    });

    // *************** Return an array containing schools in the order of the requested schoolIds.
    const orderedStudents = studentIds.map((_id) => studentMap[String(_id)]);
    return orderedStudents;
  });
}
// *************** EXPORT MODULE ***************
module.exports = StudentLoader;
