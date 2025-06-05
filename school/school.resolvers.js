// *************** IMPORT CORE ***************
const School = require("../school/school.model");

// *************** MUTATION ***************
const resolvers = {
  Query: {
    schools: async () => await School.find(),
    GetAllSchools: async () => School.find({ deleted_at: null }),
    GetOneSchool: async (_, { id }) =>
      School.findOne({ _id: id, deleted_at: null }),
  },
  Mutation: {
    // Mutation for School
    CreateSchool: async (_, { input }) => {
      const newSchool = new School(input);
      return await newSchool.save();
    },

    UpdateSchool: async (_, { input }) => {
      return await School.findOneAndUpdate(
        { _id: input.id, deleted_at: null },
        input,
        { new: true }
      );
    },

    DeleteSchool: async (_, { id }) => {
      return await School.findOneAndUpdate(
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
