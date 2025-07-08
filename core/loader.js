// *************** IMPORT MODULE ***************
const StudentLoader = require('../modules/student/student.loader');
const SchoolLoader = require('../modules/school/school.loader');
const SubjectLoader = require('../modules/subject/subject.loader');
const BlockLoader = require('../modules/block/block.loader');
const TestLoader = require('../modules/test/test.loader');
const UserLoader = require('../modules/user/user.loader');

/**
 * Initializes all DataLoader instances for batching and caching.
 *
 * @returns {Object} Loaders
 */
function InitializeLoaders() {
  return {
    StudentLoader: StudentLoader(),
    SchoolLoader: SchoolLoader(),
    SubjectLoader: SubjectLoader(),
    BlockLoader: BlockLoader(),
    TestLoader: TestLoader(),
    UserLoader: UserLoader(),
  };
}

// *************** EXPORT MODULE ***************
module.exports = InitializeLoaders;
