// *************** IMPORT MODULE ***************
const CreateStudentsByIdLoader = require('../student/student.loader');
const CreateSchoolByIdLoader = require('../school/school.loader');

/**
 * Initializes all DataLoader instances for batching and caching.
 *
 * @returns {Object} Loaders
 */
function initializeLoaders() {
  return {
    studentById: CreateStudentsByIdLoader(),
    schoolById: CreateSchoolByIdLoader(),
  };
}

// *************** EXPORT MODULE ***************
module.exports = initializeLoaders;
