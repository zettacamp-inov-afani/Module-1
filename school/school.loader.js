// *************** IMPORT CORE ***************
const DataLoader = require("dataloader");

// *************** IMPORT MODULE ***************
const Student = require("../student/student.model");

/**
 * Creates a DataLoader instance to batch and cache lookups of Students by School ID.
 *
 * This loader allows you to efficiently fetch all students belonging to each school,
 * solving the N+1 problem in GraphQL when resolving nested student lists in a School object.
 *
 * Each school ID will return an array of Student documents associated with that school.
 *
 * @function
 * @returns {DataLoader<string, Object[]>} A DataLoader that loads arrays of students per school ID.
 *
 * @example
 * const schoolStudentLoader = SchoolStudentLoader();
 * const studentsForSchool = await schoolStudentLoader.load("6647a8b2c1d3a1234567890f");
 */
function SchoolStudentLoader() {
  // *************** Create new instance of DataLoader
  return new DataLoader(async (schoolIds) => {
    // *************** Find all Students whose school_id is in the schoolIds array
    const students = await Student.find({ school_id: { $in: schoolIds } });

    // *************** Create dictionary to group students by school_id
    const schoolIdToStudents = {};
    schoolIds.forEach((id) => (schoolIdToStudents[id] = []));
    students.forEach((student) => {
      const key = student.school_id.toString();
      if (schoolIdToStudents[key]) {
        schoolIdToStudents[key].push(student);
      }
    });

    // *************** Return an array containing student lists in the order of the requested schoolIds.
    return schoolIds.map((id) => schoolIdToStudents[id]);
  });
}

// *************** EXPORT MODULE ***************
module.exports = SchoolStudentLoader;
