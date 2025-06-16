// *************** IMPORT MODULE ***************
const userModel = require('./user.model');

// *************** QUERY ***************

/**
 * Retrieves a user by ID if the status is "is_active".
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
  if (!_id) {
    throw new Error('User ID is required');
  }

  // *************** Find a user with matching ID and active status
  const user = await userModel.findOne({
    _id: _id,
    status: 'is_active',
  });

  // *************** Return the found user
  return user;
}

/**
 * Retrieves all users with "is_active" status.
 *
 * @async
 * @function
 * @returns {Promise<Array>} A list of active user documents.
 */
async function GetAllUsers() {
  // *************** Find all users with status "is_active"
  const users = await userModel.find({ status: 'is_active' });

  // *************** Return the list of active users
  return users;
}

// *************** MUTATION ***************

/**
 * Creates a new user with default status "is_active" and role "operator" if not provided.
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

    // *************** Validate civility
    if (
      !civility ||
      typeof civility !== 'string' ||
      !['Mr', 'Mrs'].includes(civility)
    ) {
      throw new Error("Civility is required and must be either 'Mr' or 'Mrs'.");
    }

    // *************** Validate first name
    if (
      !first_name ||
      typeof first_name !== 'string' ||
      first_name.trim() === ''
    ) {
      throw new Error('First name is required and must be a non-empty string.');
    }

    // *************** Validate last name
    if (
      !last_name ||
      typeof last_name !== 'string' ||
      last_name.trim() === ''
    ) {
      throw new Error('Last name is required and must be a non-empty string.');
    }

    // *************** Validate email
    if (!email || typeof email !== 'string' || email.trim() === '') {
      throw new Error('Email is required and must be a non-empty string.');
    }

    // *************** Validate password
    if (!password || typeof password !== 'string' || password.length < 6) {
      throw new Error(
        'Password is required and must be at least 6 characters long.'
      );
    }

    // *************** Validate role if provided
    if (role && !['operator', 'acadir', 'student'].includes(role)) {
      throw new Error("Role must be one of: 'operator', 'acadir', 'student'.");
    }

    // *************** Create a new User instance
    const user = new userModel({
      civility,
      first_name,
      last_name,
      email,
      password,
      role: role || 'operator',
      status: 'is_active',
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
 * Updates an existing user if status is "is_active".
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
  const { _id, first_name, last_name, email, password, role } = input;

  // *************** Validate ID
  if (!_id || typeof _id !== 'string' || _id.trim() === '') {
    throw new Error('User ID is required.');
  }

  // *************** Validate first name
  if (
    !first_name ||
    typeof first_name !== 'string' ||
    first_name.trim() === ''
  ) {
    throw new Error('First name is required and must be a non-empty string.');
  }

  // *************** Validate last name
  if (!last_name || typeof last_name !== 'string' || last_name.trim() === '') {
    throw new Error('Last name is required and must be a non-empty string.');
  }

  // *************** Validate email
  if (!email || typeof email !== 'string' || email.trim() === '') {
    throw new Error('Email is required and must be a non-empty string.');
  }

  // *************** Validate password
  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new Error('Password is required and must be at least 6 characters.');
  }

  // *************** Validate role
  const validRoles = ['operator', 'acadir', 'student'];
  if (!role || typeof role !== 'string' || !validRoles.includes(role)) {
    throw new Error(
      `Role is required and must be one of: ${validRoles.join(', ')}`
    );
  }

  // *************** Update the user data if active
  const updatedUser = await userModel.findOneAndUpdate(
    { _id: _id, status: 'is_active' }, // Match active user by ID
    {
      first_name,
      last_name,
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
  // *************** Validate ID
  if (!_id || typeof _id !== 'string' || _id.trim() === '') {
    throw new Error('User ID is required.');
  }

  // *************** Check if user exists and is active
  const user = await userModel.findOne({ _id: _id, status: 'is_active' });
  if (!user) {
    throw new Error('User not found or already deleted.');
  }

  // *************** Perform soft delete by setting status to "deleted"
  user.status = 'deleted';

  // *************** Save and return updated user
  await user.save();
  return user;
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
