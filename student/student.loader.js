// *************** IMPORT CORE ***************
const DataLoader = require('dataloader');

// *************** IMPORT MODULE ***************
const Student = require('./student.model');

/**
 * Batch function to load multiple students by their IDs.
 *
 * @param {Array<string>} studentIds - An array of student IDs to fetch.
 * @returns {Promise<Array<Object|null>>} - A promise that resolves to an array of students
 *                                          ordered to match the original input IDs.
 */
function BatchStudents(studentIds) {
  // *************** Query all students whose _id is in the list of requested studentIds
  return Student.find({ _id: { $in: studentIds } }).then((students) => {
    // Create a Map for quick lookup by ID
    const studentMap = new Map();
    students.forEach((student) => {
      // Map the student ID to the student document
      studentMap.set(student._id.toString(), student);
    });

    // Return the students in the same order as the input IDs
    const batchStudent = studentIds.map(
      (id) => studentMap.get(id.toString()) || null
    );
    return batchStudent;
  });
}

function CreateStudentsByIdLoader() {
  return new DataLoader(BatchStudents);
}

// *************** EXPORT MODULE ***************
module.exports = CreateStudentsByIdLoader;
