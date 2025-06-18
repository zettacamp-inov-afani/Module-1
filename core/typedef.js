// *************** IMPORT CORE ***************Add commentMore actions
const { mergeTypeDefs } = require('@graphql-tools/merge');

// *************** IMPORT MODULE ***************
const UserTypeDefs = require('../user/user.typedef');
const StudentTypeDefs = require('../student/student.typedef');
const SchoolTypeDefs = require('../school/school.typedef');

// *************** Merge typedefs
const typeDefs = mergeTypeDefs([UserTypeDefs, StudentTypeDefs, SchoolTypeDefs]);

// *************** EXPORT MODULE ***************
module.exports = typeDefs;
