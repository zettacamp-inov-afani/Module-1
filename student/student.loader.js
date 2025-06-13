// *************** IMPORT CORE ***************
const DataLoader = require("dataloader");

// *************** IMPORT MODULE ***************
const Student = require("./student.model");

function batchStudents(studentIds) {
  return Student.find({ _id: { $in: studentIds } }).then((students) => {
    const studentMap = new Map();
    students.forEach((student) => {
      studentMap.set(student._id.toString(), student);
    });

    return studentIds.map((id) => studentMap.get(id.toString()) || null);
  });
}

function CreateStudentsByIdLoader() {
  return new DataLoader(batchStudents);
}

module.exports = CreateStudentsByIdLoader;
