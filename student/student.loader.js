// *************** IMPORT CORE ***************
const DataLoader = require("dataloader");

// *************** IMPORT MODULE ***************
const Student = require("./student.model");

/**
 * Creates a DataLoader to batch and cache student lookups by school ID.
 * This allows GraphQL to efficiently resolve the list of students for each school
 * without triggering a separate database query per school (N+1 problem).
 *
 * @function CreateStudentsBySchoolIdLoader
 * @returns {DataLoader<string, Array<Object>>} A DataLoader instance that maps each school ID to its list of students.
 */
function CreateStudentsBySchoolIdLoader() {
  // *************** Fetch all students whose school_id is in the input list and are active
  return new DataLoader(async (schoolIds) => {
    const students = await Student.find({
      school_id: { $in: schoolIds },
      status: "is_active",
    });

    // *************** Create a Map to group students by their school_id
    const map = new Map();
    // *************** Initialize an empty array for each school ID in the input list
    schoolIds.forEach((id) => map.set(id.toString(), []));

    // *************** Populate the map with students grouped by their school_id
    students.forEach((student) => {
      const key = student.school_id.toString();
      if (map.has(key)) map.get(key).push(student);
    });

    // *************** Return the students grouped per schoolId in the same order as received
    const createStudentLoader = schoolIds.map(
      (id) => map.get(id.toString()) || []
    );
    return createStudentLoader;
  });
}

// *************** EXPORT MODULE ***************
module.exports = CreateStudentsBySchoolIdLoader;
