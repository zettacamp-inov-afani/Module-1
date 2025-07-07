// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const TaskModel = require('./task.model');

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

async function CreateTask() {}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetOneTask,
    GetAllTasks,
  },
  Mutation: { CreateTask },
};
