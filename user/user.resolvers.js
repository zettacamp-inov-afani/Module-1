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
 * Retrieves a user by ID if the status is "active".
 *
 * @async
 * @function
 * @param {Object} _ - Unused parent resolver.
 * @param {Object} args - Arguments object.
 * @param {string} args.id - ID of the user to fetch.
 * @returns {Promise<Object|null>} The user document if found.
 */
async function GetOneUser(parent, { _id }) {
  // *************** Validate input ID
  ValidateObjectId(_id, 'User ID');
  // *************** Find a user with matching ID and active status
  const user = await UserModel.findOne({
    _id: _id,
    status: 'active',
  });

  // *************** Return the found user
  return user;
}

/**
 * Retrieves all users with "active" status.
 *
 * @async
 * @function
 * @returns {Promise<Array>} A list of active user documents.
 */
async function GetAllUsers() {
  // *************** Find all users with status "active"
  const users = await UserModel.find({ status: 'active' });

  // *************** Return the list of active users
  return users;
}

// *************** MUTATION ***************

/**
 * Creates a new user with default status "active" and role "operator" if not provided.
 *
 * @async
 * @function
 * @param {Object} _ - Unused parent resolver.
 * @param {Object} args - Arguments object.
 * @param {Object} args.input - Input data for the new user.
 * @returns {Promise<Object>} The created user document.
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
    console.error('CreateUser error:', error);
    throw new Error(error.message || 'Failed to create user.');
  }
}

/**
 * Updates an existing user if status is "active".
 *
 * This method avoids using `{ new: true }` by refetching after update.
 *
 * @async
 * @function
 * @param {Object} _ - Unused parent resolver.
 * @param {Object} args - Arguments containing updated user data.
 * @returns {Promise<Object|null>} Updated user document or null if not found.
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
    { _id: _id, status: 'active' }, // Match active user by ID
    {
      first_name,
      last_name,
      civility,
      email,
      password,
      role,
    },
    { new: true } // Return updated document
  );

  return updatedUser;
}

/**
 * Soft deletes a user by changing status to "deleted".
 *
 * Only users with role "operator" or "acadir" can perform this action.
 *
 * @async
 * @function
 * @param {Object} _ - Unused parent resolver.
 * @param {Object} args - Arguments containing the ID of user to delete.
 * @returns {Promise<Object>} The updated (soft-deleted) user document.
 * @throws {Error} If unauthorized or user not found.
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
    console.error('DeleteUser error:', error);
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
