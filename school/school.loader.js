// *************** IMPORT CORE ***************
const DataLoader = require("dataloader");

// *************** IMPORT MODULE ***************
const School = require("./school.model");

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
 * @example
 * const schoolLoader = createSchoolByIdLoader();
 * const school = await schoolLoader.load("6647a8b2c1d3a1234567890f");
 */
function CreateSchoolByIdLoader() {
  // *************** Create new instance of DataLoader
  return new DataLoader(async (schoolIds) => {
    // *************** Find all Schools whose id is in the schoolIds array
    const schools = await School.find({ _id: { $in: schoolIds } });

    // *************** Create schoolMap object for dictionary
    const schoolMap = {};
    schools.forEach((school) => {
      schoolMap[school._id.toString()] = school;
    });

    // *************** Return an array containing schools in the order of the requested schoolIds.
    const createSchoolLoader = schoolIds.map((id) => schoolMap[id.toString()]);
    return createSchoolLoader;
  });
}

// *************** EXPORT MODULE ***************
module.exports = CreateSchoolByIdLoader;
