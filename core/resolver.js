// *************** IMPORT CORE ***************
const { mergeResolvers } = require('@graphql-tools/merge');

// *************** IMPORT MODULE ***************Add commentMore actions
const UserResolvers = require('../user/user.resolvers');
const StudentResolvers = require('../student/student.resolvers');
const SchoolResolvers = require('../school/school.resolvers');

// *************** Merge resolvers
const resolvers = mergeResolvers([
  UserResolvers,
  StudentResolvers,
  SchoolResolvers,
]);

// *************** EXPORT MODULE ***************
module.exports = resolvers;
