// *************** IMPORT CORE ***************
const mongoose = require('mongoose');
const validator = require('validator');

// *************** IMPORT MODULE ***************
const UserModel = require('./user.model');

// *************** IMPORT VALIDATORS ***************
const {
  ValidateObjectId,
  ValidateCivility,
  ValidateNonEmptyString,
  ValidateEmail,
  ValidatePassword,
  ValidateRole,
} = require('./user.validator');

// *************** QUERY ***************

/**
 * Retrieve a single active user by their MongoDB ObjectId.
 *
 * @param {Object} parent - Parent resolver (unused).
 * @param {Object} args - Arguments object.
 * @param {string} args._id - User ID to look for.
 * @returns {Promise<Object|null>} The found user or null if not found.
 */
async function GetOneUser(parent, { _id }) {
  // *************** Validate user ID
  ValidateObjectId(_id, 'User ID');

  // *************** Retrieve user with status 'active'
  const user = await UserModel.findOne({
    _id: _id,
    status: 'active',
  });
  return user;
}

/**
 * Retrieve all users with status "active".
 *
 * @returns {Promise<Array>} Array of active users.
 */
async function GetAllUsers() {
  // *************** Retrieve all users with status 'active'
  const users = await UserModel.find({ status: 'active' });

  return users;
}

// *************** MUTATION ***************

/**
 * Create a new user after validating the input.
 *
 * @param {Object} parent - Parent resolver (unused).
 * @param {Object} args - Arguments containing user input.
 * @param {Object} args.input - User creation input data.
 * @returns {Promise<Object>} The created user document.
 * @throws {Error} If validation fails or saving fails.
 */
async function CreateUser(parent, { input }) {
  try {
    const { civility, first_name, last_name, email, password, role } = input;

    // *************** Validate required input
    ValidateCivility(civility);
    ValidateNonEmptyString(first_name, 'First name');
    ValidateNonEmptyString(last_name, 'Last name');
    ValidateEmail(email);
    ValidatePassword(password);
    ValidateRole(role);

    // *************** Create a new User instance
    const user = new UserModel({
      civility,
      first_name,
      last_name,
      email,
      password,
      role: role || 'operator',
      status: 'active',
    });

    // *************** Save the user and return the result
    const createUser = await user.save();
    return createUser;
  } catch (error) {
    throw new Error(error.message || 'Failed to create user.');
  }
}

/**
 * Update an existing active user with new data.
 *
 * @param {Object} parent - Parent resolver (unused).
 * @param {Object} args - Arguments containing user input.
 * @param {Object} args.input - User update input data.
 * @returns {Promise<Object|null>} The updated user document, or null if not found.
 * @throws {Error} If validation fails or update fails.
 */
async function UpdateUser(parent, { input }) {
  const { _id, first_name, last_name, civility, email, password, role } = input;

  // *************** Validate required input
  ValidateObjectId(_id, 'User ID');
  ValidateCivility(civility);
  ValidateNonEmptyString(first_name, 'First name');
  ValidateNonEmptyString(last_name, 'Last name');
  ValidateEmail(email);
  ValidatePassword(password);
  ValidateRole(role);

  // *************** Update the user data if active
  const updatedUser = await UserModel.findOneAndUpdate(
    { _id: _id, status: 'active' },
    {
      first_name,
      last_name,
      civility,
      email,
      password,
      role,
    },
    { new: true }
  );

  return updatedUser;
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
async function DeleteUser(parent, { _id }) {
  try {
    // *************** Validate required input field
    ValidateObjectId(_id, 'User ID');

    // *************** Find the User with the given ID and "active" status, then update it to "deleted"
    const deletedUser = await UserModel.findByIdAndUpdate(
      { _id: _id, status: 'active' },
      { $set: { status: 'deleted', deleted_at: new Date() } },
      { new: true }
    );

    // *************** Handle case if User not found or already deleted
    if (!deletedUser) {
      throw new Error('User not found or already deleted.');
    }

    // *************** Return the updated User (now with "deleted" status)
    return deletedUser;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete User.');
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
