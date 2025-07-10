// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const UserModel = require('./user.model');

// *************** IMPORT VALIDATOR ***************
const ValidateUserInput = require('./user.validator');
const CommonValidator = require('../../utilities/validator');

// *************** QUERY ***************

/**
 * Retrieve a single active user by their MongoDB ObjectId.
 *
 * @function GetOneUser
 * @param {Object} _ - Parent resolver (unused).
 * @param {Object} args - Arguments object.
 * @param {string} args._id - User ID to look for.
 * @returns {Promise<Object|null>} The found user or null if not found.
 */
async function GetOneUser(_, { _id }) {
  try {
    // *************** Validate user ID
    CommonValidator.ValidateObjectId(_id, 'User ID');

    // *************** Retrieve user with status 'active'
    const user = await UserModel.findOne({ _id: _id, status: 'active' }).lean();

    // *************** Handle case if School not found or already deleted
    if (!user) {
      throw new ApolloError(
        'User not found or already deleted.',
        'USER_NOT_FOUND'
      );
    }
    return user;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * Retrieves all users with status "active".
 *
 * This query fetches all user documents from the database that have a status of "active".
 * It uses `.lean()` to return plain JavaScript objects for better performance.
 *
 * @async
 * @function GetAllUsers
 * @param {Object} _ - Unused parent resolver argument (GraphQL convention).
 * @param {Object} args - Arguments passed to the resolver (not used in this query).
 * @returns {Promise<Array<Object>>} A list of active user documents.
 * @throws {ApolloError} If the database query fails.
 */
async function GetAllUsers(_, args) {
  try {
    // *************** Retrieve all users with status 'active'
    const users = await UserModel.find({ status: 'active' }).lean();

    return users;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

// *************** MUTATION ***************

/**
 * Create a new user after validating the input.
 *
 * @function CreateUser
 * @param {Object} _ - Parent resolver (unused).
 * @param {Object} args - Arguments containing user input.
 * @param {Object} args.input - User creation input data.
 * @returns {Promise<Object>} The created user document.
 * @throws {Error} If validation fails or saving fails.
 */
async function CreateUser(_, { input }) {
  try {
    // *************** Validate required input
    ValidateUserInput(input);

    // *************** Create a new User instance
    const createUser = UserModel.create({
      civility: input.civility,
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      password: input.password,
      role: input.role || 'operator',
      status: 'active',
    });

    // *************** Save the user and return the result
    return createUser;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * Update an existing active user with new data.
 *
 * @function UpdateStudent
 * @param {Object} _ - Parent resolver (unused).
 * @param {Object} args - Arguments containing user input.
 * @param {Object} args.input - User update input data.
 * @returns {Promise<Object|null>} The updated user document, or null if not found.
 * @throws {Error} If validation fails or update fails.
 */
async function UpdateUser(_, { _id, input }) {
  try {
    // *************** Validate required input
    CommonValidator.ValidateObjectId(_id, 'User ID');

    // *************** Validate required input
    ValidateUserInput(input, true);

    // *************** Prepare object for dynamic updates
    const updateFields = {
      civility: input.civility,
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      role: input.role,
    };

    // *************** Update the user data if active
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: _id, status: 'active' },
      {
        $set: updateFields,
      },
      { new: true }
    );

    return updatedUser;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * Soft delete a user by updating their status to "deleted" and setting a deleted_at timestamp.
 *
 * @function DeleteUser
 * @param {Object} _ - Parent resolver (unused).
 * @param {Object} args - Arguments containing the user ID.
 * @param {string} args._id - The ID of the user to delete.
 * @returns {Promise<Object>} The soft-deleted user document.
 * @throws {Error} If user is not found or already deleted.
 */
async function DeleteUser(_, { _id }) {
  try {
    // *************** Validate input presence (fail-fast)
    if (!_id) {
      throw new ApolloError(error.message || 'Input undefined', 'INPUT_ERROR');
    }
    // *************** Validate required input field
    CommonValidator.ValidateObjectId(_id, 'User ID');

    // *************** Find the User with the given ID and "active" status, then update it to "deleted"
    const deletedUser = await UserModel.updateOne(
      { _id, status: 'active' },
      {
        $set: { status: 'deleted', deleted_at: new Date() },
      }
    );

    // *************** Handle case if User not found or already deleted
    if (deletedUser.matchedCount === 0) {
      throw new ApolloError(
        'User not found or already deleted.',
        'USER_NOT_FOUND'
      );
    }

    // *************** Return the updated User (now with "deleted" status)
    return _id;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetOneUser,
    GetAllUsers,
  },
  Mutation: {
    CreateUser,
    UpdateUser,
    DeleteUser,
  },
};
