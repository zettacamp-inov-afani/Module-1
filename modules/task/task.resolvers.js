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

async function GetAllTasks() {}

async function CreateTask() {}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetOneTask,
    GetAllTasks,
  },
  Mutation: { CreateTask },
};
