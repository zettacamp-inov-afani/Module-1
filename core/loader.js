// *************** IMPORT MODULE ***************
const StudentLoader = require('../modules/student/student.loader');
const SchoolLoader = require('../modules/school/school.loader');

/**
 * Initializes all DataLoader instances for batching and caching.
 *
 * @returns {Object} Loaders
 */
function InitializeLoaders() {
  return {
    StudentLoader: StudentLoader(),
    SchoolLoader: SchoolLoader(),
  };
}

// *************** EXPORT MODULE ***************
module.exports = InitializeLoaders;
