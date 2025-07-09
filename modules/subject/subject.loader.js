// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');

// *************** IMPORT MODULE ***************
const SubjectModel = require('./subject.model');

// *************** IMPORT VALIDATOR ***************
const CommonValidator = require('../../utilities/validator');

/**
 * Creates a DataLoader instance to batch and cache Subject lookups by their IDs.
 *
 * This function performs the following steps:
 * - Validates the array of `subject_ids` using a common validator.
 * - Fetches all matching Subject documents from the database.
 * - Maps the documents to their corresponding IDs to maintain request order.
 * - Returns the results in the same order as the requested IDs.
 *
 * Useful for optimizing GraphQL resolvers by reducing N+1 query problems.
 *
 * @returns {DataLoader<string, Object|null>} A DataLoader instance for batching Subject lookups.
 *
 * @throws {ApolloError} If any of the subject_ids are invalid.
 */
function SubjectLoader() {
  // *************** Create new instance of DataLoader
  return new DataLoader(async (subject_ids) => {
    // ***************  Validate the incoming subject ids
    CommonValidator.ValidateMongoObjectIds(subject_ids);

    // *************** Find all Subject whose id is in the subject ids array
    const subjects = await SubjectModel.find({
      _id: { $in: subject_ids },
    }).lean();

    // *************** Create subjectMap object for dictionary
    const subjectMap = {};
    subjects.forEach((subject) => {
      subjectMap[String(subject._id)] = subject;
    });

    // *************** Return an array containing subjects in the order of the requested subject ids.
    const orderedSubjects = subject_ids.map((_id) => subjectMap[String(_id)]);
    return orderedSubjects;
  });
}

// *************** EXPORT MODULE ***************
module.exports = SubjectLoader;
