// *************** IMPORT LIBRARY ***************
const { mergeTypeDefs } = require('@graphql-tools/merge');

// *************** IMPORT MODULE ***************
const UserTypeDefs = require('../modules/user/user.typedef');
const StudentTypeDefs = require('../modules/student/student.typedef');
const SchoolTypeDefs = require('../modules/school/school.typedef');
const BlockTypeDefs = require('../modules/block/block.typedef');
const SubjectTypeDefs = require('../modules/subject/subject.typedef');
const TestTypeDefs = require('../modules/test/test.typedef');
const TaskTypeDefs = require('../modules/task/task.typedef');
const StudentTestResultTypeDefs = require('../modules/studentTestResult/student_test_result.typedef');

// *************** Merge typedefs
const typeDefs = mergeTypeDefs([
  UserTypeDefs,
  StudentTypeDefs,
  SchoolTypeDefs,
  BlockTypeDefs,
  SubjectTypeDefs,
  TestTypeDefs,
  TaskTypeDefs,
  StudentTestResultTypeDefs,
]);

// *************** EXPORT MODULE ***************
module.exports = typeDefs;
