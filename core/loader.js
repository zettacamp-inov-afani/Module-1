// *************** IMPORT MODULE ***************
const CreateStudentsByIdLoader = require('../modules/student/student.loader');
const CreateSchoolByIdLoader = require('../modules/school/school.loader');

/**
 * Initializes all DataLoader instances for batching and caching.
 *
 * @returns {Object} Loaders
 */
function InitializeLoaders() {
  return {
    studentById: CreateStudentsByIdLoader(),
    schoolById: CreateSchoolByIdLoader(),
  };
}

// *************** EXPORT MODULE ***************
module.exports = InitializeLoaders;
