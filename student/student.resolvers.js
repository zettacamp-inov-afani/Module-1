// *************** IMPORT CORE ***************
const User = require("../student/student.model");

// *************** MUTATION ***************
const resolvers = {
  Query: {
    students: async () => await Student.find(),
    GetAllStudents: async () => Student.find({ delete_at: null }),
    GetOneStudent: async (_, { id }) =>
      await Student.findOne({ _id: id, deleted_at: null }),
  },
  Mutation: {
    // Mutation for Student
    CreateStudent: async (_, { input }) => {
      const newStudent = new Student(input);
      return await newStudent.save();
    },

    UpdateStudent: async (_, { id, input }) => {
      return await Student.findOneAndUpdate(
        { _id: id, deleted_at: null },
        input,
        { new: true }
      );
    },
    DeleteStudent: async (_, { id }) => {
      return await Student.findOneAndUpdate(
        { _id: id },
        { deleted_at: new Date() },
        { new: true }
      );
    },
  },
  School: {
    students: async (parent) => {
      return await Student.find({ schoolId: parent.id });
    },
  },
};

module.exports = resolvers;
