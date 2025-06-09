// *************** IMPORT CORE ***************
const Student = require("./student.model");

// *************** QUERY ***************
async function GetStudent(_, { id }) {
  return await Student.findOne({ _id: id, status: "is_active" });
}

async function GetAllStudents() {
  return await Student.find({ status: "is_active" });
}

// *************** MUTATION ***************
async function CreateStudent(_, { input }) {
  const student = new Student({
    first_name: input.name.first_name,
    last_name: input.name.last_name,
    school: input.school_id,
    status: "is_active",
  });

  return await student.save();
}

async function UpdateStudent(_, { input }) {
  const { id, name, school_id } = input;

  // Update the data
  await Student.findOneAndUpdate(
    { _id: id, status: "is_active" },
    {
      first_name: name.first_name,
      last_name: name.last_name,
      school: school_id,
    }
  );

  // Return the data
  return await Student.findById(id);
}

async function SoftDeleteStudent(_, { id }) {
  // Update the status
  await Student.findOneAndUpdate(
    { _id: id, status: "is_active" },
    { status: "deleted" }
  );

  // Return the data
  return await Student.findById(id);
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetStudent,
    GetAllStudents,
  },
  Mutation: {
    CreateStudent,
    UpdateStudent,
    SoftDeleteStudent,
  },
};
