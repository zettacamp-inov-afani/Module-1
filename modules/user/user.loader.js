// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');

// *************** IMPORT MODULE ***************
const UserModel = require('./user.model');

// *************** IMPORT VALIDATOR ***************
const CommonValidator = require('../../utilities/validator');

/**
 * Creates a DataLoader instance to batch and cache User lookups by their IDs.
 *
 * This function performs the following steps:
 * - Validates the incoming array of `user_ids` using a common validator.
 * - Fetches all User documents that match the provided IDs.
 * - Builds a lookup map (`userMap`) to associate each user ID with its User document.
 * - Returns the User documents in the same order as the input `user_ids` array.
 *
 * This loader helps to prevent N+1 query problems in GraphQL by batching and caching User lookups.
 *
 * @returns {DataLoader<string, Object|null>} A DataLoader instance for resolving User references by ID.
 *
 * @throws {ApolloError} If the provided `user_ids` are invalid.
 */
function UserLoader() {
  // *************** Create new instance of DataLoader
  return new DataLoader(async (user_ids) => {
    // ***************  Validate the incoming user_ids
    CommonValidator.ValidateMongoObjectIds(user_ids);

    // *************** Find all Users whose id is in the user_ids array
    const users = await UserModel.find({
      _id: { $in: user_ids },
    }).lean();

    // *************** Create userMap object for dictionary
    const userMap = {};
    users.forEach((user) => {
      userMap[String(user._id)] = user;
    });

    // *************** Return an array containing users in the order of the requested user_ids.
    const orderedUsers = user_ids.map((_id) => userMap[String(_id)]);
    return orderedUsers;
  });
}

// *************** EXPORT MODULE ***************
module.exports = UserLoader;
