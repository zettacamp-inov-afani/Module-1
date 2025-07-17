// *************** IMPORT LIBRARY ***************
const { mergeResolvers } = require('@graphql-tools/merge');

// *************** IMPORT MODULE ***************
const UserResolvers = require('../modules/user/user.resolvers');
const StudentResolvers = require('../modules/student/student.resolvers');
const SchoolResolvers = require('../modules/school/school.resolvers');
const BlockResolvers = require('../modules/block/block.resolvers');
const SubjectResolvers = require('../modules/subject/subject.resolvers');
const TestResolvers = require('../modules/test/test.resolvers');
const TaskResolvers = require('../modules/task/task.resolvers');
const StudentTestResultResolvers = require('../modules/studentTestResult/student_test_result.resolvers');

// *************** Merge resolvers
const resolvers = mergeResolvers([
  UserResolvers,
  StudentResolvers,
  SchoolResolvers,
  BlockResolvers,
  SubjectResolvers,
  TestResolvers,
  TaskResolvers,
  StudentTestResultResolvers,
]);

// *************** EXPORT MODULE ***************
module.exports = resolvers;
