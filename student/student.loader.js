// *************** IMPORT CORE ***************
const DataLoader = require("dataloader");
const School = require("../school/school.model");

// Function for dataLoader
function createSchoolByIdLoader() {
  return new DataLoader(async (schoolIds) => {
    const schools = await School.find({ _id: { $in: schoolIds } });
    const schoolMap = {};
    schools.forEach((school) => {
      schoolMap[school._id.toString()] = school;
    });
    return schoolIds.map((id) => schoolMap[id.toString()]);
  });
}

module.exports = createSchoolByIdLoader;
