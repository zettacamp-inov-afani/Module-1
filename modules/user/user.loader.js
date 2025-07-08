// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');

// *************** IMPORT MODULE ***************
const UserModel = require('./user.model');

// *************** IMPORT VALIDATOR ***************
const CommonValidator = require('../../utilities/validator');

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
