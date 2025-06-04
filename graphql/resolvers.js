const User = require("../user/user.model");
const Student = require("../student/student.model");
const School = require("../school/school.model");

const resolvers = {
  Query: {
    users: async () => await User.find(),
    students: async () => await Student.find(),
    schools: async () => await School.find(),
  },
  School: {
    students: async (parent) => {
      return await Student.find({ schoolId: parent.id });
    },
  },
};

module.exports = resolvers;
