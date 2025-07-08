// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');

// *************** IMPORT MODULE ***************
const TestModel = require('./test.model');

// *************** IMPORT VALIDATOR ***************
const CommonValidator = require('../../utilities/validator');

function TestLoader() {
  // *************** Create new instance of DataLoader
  return new DataLoader(async (test_id) => {
    // ***************  Validate the incoming test id
    CommonValidator.ValidateMongoObjectIds(test_id);

    // *************** Find all Tests whose id is in the test ids array
    const tests = await TestModel.find({
      _id: { $in: test_id },
    }).lean();

    // *************** Create testMap object for dictionary
    const testMap = {};
    tests.forEach((test) => {
      testMap[String(test._id)] = test;
    });

    // *************** Return an array containing tests in the order of the requested test ids.
    const orderedTests = test_id.map((_id) => testMap[String(_id)]);
    return orderedTests;
  });
}

// *************** EXPORT MODULE ***************
module.exports = TestLoader;
