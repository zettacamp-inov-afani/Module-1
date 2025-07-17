// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');

// *************** IMPORT MODULE ***************
const TestModel = require('./test.model');

// *************** IMPORT VALIDATOR ***************
const CommonValidator = require('../../utilities/validator');

/**
 * Creates a DataLoader instance to batch and cache Test lookups by their IDs.
 *
 * This function performs the following operations:
 * - Validates the array of `test_ids` to ensure they are valid MongoDB ObjectIds.
 * - Queries the database for all Test documents matching the provided IDs.
 * - Maps the resulting Test documents to their corresponding IDs.
 * - Returns the Test documents in the same order as the original `test_ids` array.
 *
 * This loader is used to prevent N+1 query problems in GraphQL field resolvers
 * by batching and caching Test lookups.
 *
 * @returns {DataLoader<string, Object|null>} A DataLoader instance for batching Test queries.
 *
 * @throws {ApolloError} If any of the test_ids are invalid.
 */
function TestLoader() {
  // *************** Create new instance of DataLoader
  return new DataLoader(async (test_ids) => {
    // ***************  Validate the incoming test id
    CommonValidator.ValidateMongoObjectIds(test_ids);

    // *************** Find all Tests whose id is in the test ids array
    const tests = await TestModel.find({
      _id: { $in: test_ids },
    }).lean();

    // *************** Create testMap object for dictionary
    const testMap = {};
    tests.forEach((test) => {
      testMap[String(test._id)] = test;
    });

    // *************** Return an array containing tests in the order of the requested test ids.
    const orderedTests = test_ids.map((_id) => testMap[String(_id)]);
    return orderedTests;
  });
}

// *************** EXPORT MODULE ***************
module.exports = TestLoader;
