// *************** IMPORT CORE ***************Add commentMore actions
const { mergeTypeDefs } = require('@graphql-tools/merge');

// *************** IMPORT MODULE ***************
const UserTypeDefs = require('../modules/user/user.typedef');
const StudentTypeDefs = require('../modules/student/student.typedef');
const SchoolTypeDefs = require('../modules/school/school.typedef');

// *************** Merge typedefs
const typeDefs = mergeTypeDefs([UserTypeDefs, StudentTypeDefs, SchoolTypeDefs]);

// *************** EXPORT MODULE ***************
module.exports = typeDefs;
