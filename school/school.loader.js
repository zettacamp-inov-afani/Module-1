const DataLoader = require("dataloader");
const Student = require("../student/student.model");

function SchoolStudentLoader() {
  return new DataLoader(async (schoolIds) => {
    const students = await Student.find({ school_id: { $in: schoolIds } });
    const schoolIdToStudents = {};

    schoolIds.forEach((id) => (schoolIdToStudents[id] = []));
    students.forEach((student) => {
      const key = student.school_id.toString();
      if (schoolIdToStudents[key]) {
        schoolIdToStudents[key].push(student);
      }
    });

    return schoolIds.map((id) => schoolIdToStudents[id]);
  });
}

module.exports = SchoolStudentLoader;
