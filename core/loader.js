// *************** IMPORT MODULE ***************
const StudentLoader = require('../modules/student/student.loader');
const SchoolLoader = require('../modules/school/school.loader');
const SubjectLoader = require('../modules/subject/subject.loader');

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
  };
}

// *************** EXPORT MODULE ***************
module.exports = InitializeLoaders;
