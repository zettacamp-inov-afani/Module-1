// *************** IMPORT CORE ***************
const DataLoader = require('dataloader');

// *************** IMPORT MODULE ***************
const SchoolModel = require('./school.model');

// *************** IMPORT VALIDATOR ***************
const CommonValidator = require('../utilities/validator');
/**
 * Creates a DataLoader instance to batch and cache school lookups by ID.
 *
 * This function helps prevent the N+1 query problem by combining multiple
 * requests for schools into a single database query. It then maps each
 * requested ID to the corresponding school document in the correct order.
 *
 * @function
 * @returns {DataLoader<string, Object>} A DataLoader that loads School documents by their ID.
 *
 *
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
    const orderedSchools = schoolIds.map((id) => schoolMap[String(id)]);
    return orderedSchools;
  });
}

// *************** EXPORT MODULE ***************
module.exports = SchoolLoaders;
