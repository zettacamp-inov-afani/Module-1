// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');

// *************** IMPORT MODULE ***************
const SchoolModel = require('./school.model');

// *************** IMPORT VALIDATOR ***************
const CommonValidator = require('../../utilities/validator');

/**
 * Creates a DataLoader instance to batch and cache school retrievals by ID.
 *
 * This function returns a DataLoader that:
 * - Validates incoming school IDs.
 * - Fetches all matching school documents from the database.
 * - Builds a dictionary to map each school by its ID.
 * - Returns the schools in the same order as the requested IDs.
 *
 * Helps avoid N+1 problems when resolving school data in GraphQL.
 *
 * @function SchoolLoaders
 * @returns {DataLoader<string, Object>} A DataLoader instance that loads schools by their ObjectId.
 */
function SchoolLoaders() {
  // *************** Create new instance of DataLoader
  return new DataLoader(async (schoolIds) => {
    // ***************  Validate the incoming schoolIds
    CommonValidator.ValidateMongoObjectIds(schoolIds);
    // *************** Find all Schools whose id is in the schoolIds array
    const schools = await SchoolModel.find({ _id: { $in: schoolIds } }).lean();

    // *************** Create schoolMap object for dictionary
    const schoolMap = {};
    schools.forEach((school) => {
      schoolMap[String(school._id)] = school;
    });

    // *************** Return an array containing schools in the order of the requested schoolIds.
    const orderedSchools = schoolIds.map((_id) => schoolMap[String(_id)]);
    return orderedSchools;
  });
}

// *************** EXPORT MODULE ***************
module.exports = SchoolLoaders;
