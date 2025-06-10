// *************** IMPORT CORE ***************
const User = require("./user.model");

// Dummy user login
const dummyUser = {
  _id: "dummy_user_id",
  role: "operator", // Change for access simulations
};

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
async function GetUser(_, { id }) {
  // Find a user by ID and ensure they are active
  return await User.findOne({ _id: id, status: "is_active" });
}

/**
 * Retrieves all users with "is_active" status.
 *
 * @async
 * @function
 * @returns {Promise<Array>} A list of active user documents.
 */
async function GetAllUsers() {
  // Fetch all users whose status is active
  return await User.find({ status: "is_active" });
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
async function CreateUser(_, { input }) {
  // Create a new User instance with data from input
  const user = new User({
    // Set user's first name
    first_name: input.first_name,

    // Set user's last name
    last_name: input.last_name,

    // Set user's email
    email: input.email,

    // Set user's password
    password: input.password,

    // Default to "operator" if no role is provided
    role: input.role || "operator",

    // Set initial status
    status: "is_active",
  });

  // Save the user and return the result
  return await user.save();
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
async function UpdateUser(_, { input }) {
  const { id, first_name, last_name, email, password, role } = input;

  // Update the user data if active
  await User.findOneAndUpdate(
    // Match active user by ID
    { _id: id, status: "is_active" },
    {
      // Update first name
      first_name,

      // Update last name
      last_name,

      // Update email
      email,

      // Update password
      password,

      // Update role
      role,
    }
  );

  // Return the updated document (manually retrieved)
  return await User.findById(id);
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
async function SoftDeleteUser(_, { id }) {
  // Check if dummy user has permission
  if (dummyUser.role !== "operator" && dummyUser.role !== "acadir") {
    throw new Error("Unauthorized: Only operator or acadir can delete users.");
  }

  // Check if user exists and is active
  const user = await User.findOne({ _id: id, status: "is_active" });

  if (!user) {
    throw new Error("User not found or already deleted.");
  }

  // Perform soft delete by setting status to "deleted"
  user.status = "deleted";

  // Save and return updated user
  await user.save();
  return user;
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetUser,
    GetAllUsers,
  },
  Mutation: {
    CreateUser,
    UpdateUser,
    SoftDeleteUser,
  },
};
