// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const TaskModel = require('./task.model');
const TestModel = require('../test/test.model.js');
const UserModel = require('../user/user.model.js');

// *************** IMPORT VALIDATOR ***************
const ValidateTaskInput = require('./task.validator');
const CommonValidator = require('../../utilities/validator');

// *************** QUERY ***************

/**
 * Retrieve a single test document by its ID, only if its status is not "deleted".
 *
 * @returns {Promise<Object|null>} Returns the found test document or null if not found.
 * @throws {ApolloError} If the ID is invalid or if an error occurs during retrieval.
 */
async function GetOneTask(_, { _id }) {
  try {
    // *************** Validate Subject ID
    CommonValidator.ValidateObjectId(_id, 'Test ID');

    // *************** Find task by ID and check if status is not deleted
    const test = await TaskModel.findOne({
      _id: _id,
      task_status: { $ne: 'deleted' },
    }).lean();

    return test;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * Retrieves all tasks that are not marked as deleted.
 *
 * This function queries the `Task` collection to find all documents
 * where the `task_status` is not equal to `'deleted'`, then returns
 * them as plain JavaScript objects.
 *
 * @async
 * @function GetAllTasks
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of task documents.
 * @throws {ApolloError} If there is an error during the database query.
 */
async function GetAllTasks() {
  try {
    // *************** Retrieve all tasks with status is not deleted
    const tasks = await TaskModel.find({
      task_status: { $ne: 'deleted' },
    }).lean();

    // *************** return the result
    return tasks;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * Creates a new Task document in the database.
 *
 * @async
 * @function CreateTask
 * @param {Object} _ - Unused root parameter (standard in GraphQL resolvers).
 * @param {Object} input - The input object containing the task details.
 * @param {string} input.test_id - The ID of the associated test.
 * @param {string} input.user_id - The ID of the assigned user.
 * @param {string} input.task_type - The type of the task (e.g., 'assign_corrector').
 * @param {string} input.task_status - The status of the task (e.g., 'pending').
 * @param {Date} [input.due_date] - Optional due date for the task.
 * @returns {Promise<Object>} A promise that resolves to the created Task document.
 * @throws {ApolloError} If input validation fails or if an error occurs during task creation.
 */
async function CreateTask() {
  try {
    // *************** Validate required input
    ValidateTaskInput(input);

    // *************** Create a new Task instance
    const createTask = await TaskModel.create({
      test_id: input.test_id,
      user_id: input.user_id,
      task_type: input.task_type,
      task_status: input.task_status,
      due_date: input.due_date,
    });

    return createTask;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * Updates a task document by its ID with the provided input fields.
 *
 * @async
 * @function UpdateTask
 * @param {Object} _ - Unused root parameter (standard in GraphQL resolvers).
 * @param {string} _id - The ID of the task to update.
 * @param {Object} input - The input object containing updated task fields.
 * @param {string} input.test_id - The ID of the associated test.
 * @param {string} input.user_id - The ID of the user assigned to the task.
 * @param {string} input.task_type - The type of task (e.g., assign_corrector, enter_marks, validate_marks).
 * @param {string} input.task_status - The current status of the task (e.g., pending, in_progress, completed).
 * @param {Date} [input.due_date] - Optional due date for the task.
 * @returns {Promise<Object>} The updated task document.
 * @throws {ApolloError} If validation fails or the update operation fails.
 */
async function UpdateTask(_, { _id, input }) {
  try {
    // *************** Validate task ID (must be valid MongoDB ObjectId)
    CommonValidator.ValidateObjectId(_id, 'Task ID');

    // *************** Validate task input
    ValidateTaskInput(input);

    const updateFields = {
      test_id: input.test_id,
      user_id: input.user_id,
      task_type: input.task_type,
      task_status: input.task_status,
      due_date: input.due_date,
    };

    // *************** Update the task data
    const updatedTask = await TaskModel.findOneAndUpdate(
      { _id: _id, task_status: { $ne: 'deleted' } },
      { $set: updateFields },
      { new: true }
    ).lean();

    // *************** Handle case if Task not found or already deleted
    if (!updatedTask) {
      throw new ApolloError(
        'Task not found or already deleted.',
        'TASK_NOT_FOUND'
      );
    }

    return updatedTask;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

async function AssignCorrector() {}

/**
 * Soft deletes a task by updating its status to 'deleted' and setting the deleted timestamp.
 *
 * @async
 * @function DeleteTask
 * @param {Object} _ - Unused root parameter (standard in GraphQL resolvers).
 * @param {string} _id - The ID of the task to delete.
 * @returns {Promise<Object>} The updated (soft-deleted) task document.
 * @throws {ApolloError} If validation fails or the deletion operation fails.
 */
async function DeleteTask(_, { _id }) {
  try {
    // *************** Validate the task id
    CommonValidator.ValidateObjectId(_id, 'Task ID');

    // *************** Find the Task with the given ID and not 'deleted' status, then update it to "deleted"
    const deletedTask = await TaskModel.findOneAndUpdate(
      { _id, task_status: { $ne: 'deleted' } },
      { $set: { task_status: 'deleted', deleted_at: new Date() } }
    );

    return deletedTask;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetOneTask,
    GetAllTasks,
  },
  Mutation: {
    CreateTask,
    UpdateTask,
    AssignCorrector,
    DeleteTask,
  },
};
