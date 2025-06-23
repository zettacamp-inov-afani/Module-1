// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const UserModel = require('./user.model');

// *************** IMPORT VALIDATORS ***************
const ValidateUserInput = require('./user.validator');
const CommonValidator = require('../../utilities/validator');

// *************** QUERY ***************

/**
 * Retrieve a single active user by their MongoDB ObjectId.
 *
 * @param {Object} parent - Parent resolver (unused).
 * @param {Object} args - Arguments object.
 * @param {string} args._id - User ID to look for.
 * @returns {Promise<Object|null>} The found user or null if not found.
 */
async function GetOneUser(_, { _id }) {
  try {
    // *************** Validate user ID
    CommonValidator.ValidateObjectId(_id, 'User ID');

    // *************** Retrieve user with status 'active'
    const user = await UserModel.findOne({
      _id: _id,
      status: 'active',
    }).lean();
    return user;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * Retrieves all users with status 'active'.
 *
 * @param {Object} _ - Unused parent argument (GraphQL resolver signature).
 * @param {Object} args - Unused arguments object.
 *
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of active user objects.
 *
 * @throws {ApolloError} If any error occurs while retrieving the users.
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

    const { civility, first_name, last_name, email, password, role } = input;

    // *************** Create a new User instance
    const createUser = UserModel.create({
      civility,
      first_name,
      last_name,
      email,
      password,
      role: role || 'operator',
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
 * @param {Object} _ - Parent resolver (unused).
 * @param {Object} args - Arguments containing user input.
 * @param {Object} args.input - User update input data.
 * @returns {Promise<Object|null>} The updated user document, or null if not found.
 * @throws {Error} If validation fails or update fails.
 */
async function UpdateUser(_, { _id, input }) {
  try {
    // *************** Validate required input
    ValidateUserInput(input);

    // *************** Validate required input
    CommonValidator.ValidateObjectId(_id, 'User ID');

    const { civility, first_name, last_name, email, password, role } = input;

    // *************** Prepare object for dynamic updates
    const updateFields = {
      civility,
      first_name,
      last_name,
      email,
      password,
      role,
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
 * @param {Object} parent - Parent resolver (unused).
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
    const deletedUser = await UserModel.findByIdAndUpdate(_id, {
      $set: { status: 'deleted', deleted_at: new Date() },
    });

    // *************** Handle case if User not found or already deleted
    if (!deletedUser) {
      throw new ApolloError(
        'User not found or already deleted.',
        'USER_NOT_FOUND'
      );
    }

    // *************** Return the updated User (now with "deleted" status)
    return { _id };
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
