// *************** IMPORT LIBRARY ***************
const { mergeResolvers } = require('@graphql-tools/merge');

// *************** IMPORT MODULE ***************
const UserResolvers = require('../modules/user/user.resolvers');
const StudentResolvers = require('../modules/student/student.resolvers');
const SchoolResolvers = require('../modules/school/school.resolvers');

// *************** Merge resolvers
const resolvers = mergeResolvers([
  UserResolvers,
  StudentResolvers,
  SchoolResolvers,
]);

// *************** EXPORT MODULE ***************
module.exports = resolvers;
