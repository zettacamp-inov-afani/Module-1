// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server-express');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// *************** IMPORT MODULE ***************
const TaskModel = require('./task.model');
const TestModel = require('../test/test.model.js');
const UserModel = require('../user/user.model.js');
const StudentModel = require('../student/student.model.js');

// *************** IMPORT VALIDATOR ***************
const ValidateTaskInput = require('./task.validator');
const CommonValidator = require('../../utilities/validator');

// *************** QUERY ***************

/**
 * Retrieves a single Task by its ID, excluding those marked as deleted.
 *
 * Validates the provided Task ID and fetches the Task document
 * from the database if its `task_status` is not `'deleted'`.
 *
 * @param {Object} _ - Unused first resolver argument (parent/root).
 * @param {string} _id - The ID of the Task to retrieve.
 * @returns {Promise<Object|null>} The Task document if found and not deleted, otherwise null.
 *
 * @throws {ApolloError} If the ID is invalid or the query fails.
 */
async function GetOneTask(_, { _id }) {
  try {
    // *************** Validate Subject ID
    CommonValidator.ValidateObjectId(_id, 'Test ID');

    // *************** Find task by ID and check if status is not deleted
    const task = await TaskModel.findOne({
      _id: _id,
      status: 'active',
    }).lean();

    return task;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * Retrieves all tasks from the database with status set to "active".
 *
 * @async
 * @function GetAllTasks
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of active task objects.
 * @throws {ApolloError} If an error occurs during the database query.
 */
async function GetAllTasks() {
  try {
    // *************** Retrieve all tasks with status is not deleted
    const tasks = await TaskModel.find({
      status: 'active',
    }).lean();

    // *************** return the result
    return tasks;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

// *************** MUTATION ***************

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
async function CreateTask(_, { input }) {
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

/**
 * Assigns a user as a test corrector by updating the task status,
 * creating a new task for entering marks, and sending a notification email.
 *
 * @async
 * @function AssignCorrector
 * @param {Object} _ - The parent resolver object (unused).
 * @param {Object} inputObj - The input object containing corrector assignment data.
 * @param {Object} inputObj.input - The actual input fields.
 * @param {string} inputObj.input.test_id - The ID of the test to assign.
 * @param {string} inputObj.input.user_id - The ID of the user being assigned.
 * @returns {Promise<string>} The ID of the updated `assign_corrector` task.
 * @throws {ApolloError} If validation fails, task/user/test is not found, or sending email fails.
 */
async function AssignCorrector(_, { input }) {
  try {
    // *************** Validate test_id and user_id
    CommonValidator.ValidateObjectId(input.test_id, 'Test ID');
    CommonValidator.ValidateObjectId(input.user_id, 'User ID');

    // *************** Update AssignCorrector Task Status Only
    const updatedTask = await TaskModel.findOneAndUpdate(
      {
        test_id: input.test_id,
        task_type: 'assign_corrector',
        task_status: 'pending',
      },
      {
        $set: {
          task_status: 'completed',
          updated_at: new Date(),
        },
      }
    );

    if (!updatedTask) {
      throw new ApolloError(
        'Assign Corrector task not found or already completed.',
        'TASK_NOT_FOUND'
      );
    }

    // *************** Create Enter Marks Task for the Corrector
    await TaskModel.create({
      test_id: input.test_id,
      user_id: input.user_id,
      task_type: 'enter_marks',
      task_status: 'pending',
    });

    // *************** Find Corrector User
    const corrector = await UserModel.findById(input.user_id).lean();
    if (!corrector || !corrector.email) {
      throw new ApolloError(
        'Corrector not found or missing email.',
        'USER_NOT_FOUND'
      );
    }

    // *************** Find Test
    const test = await TestModel.findById(updatedTask.test_id).lean();
    if (!test) {
      throw new ApolloError('Test not found.', 'TEST_NOT_FOUND');
    }

    // *************** Get All Students
    const students = await StudentModel.find({}).lean();

    // *************** Step 3: Send email via SendGrid
    const emailPayload = {
      to: corrector.email,
      from: 'inovafani@gmail.com',
      subject: 'You have been assigned as a Test Corrector!',
      html: `
        <h2>You have been assigned as a Test Corrector!</h2>
        <p><strong>Test Name:</strong> ${test.name}</p>
        <p><strong>Subject:</strong> ${test.subject_id}</p>
        <p><strong>Description:</strong> ${test.description || '-'}</p>
        <p><strong>List of Students:</strong></p>
        <ul>
          ${students
            .map((student) => `<li>${student.first_name}</li>`)
            .join('')}
        </ul>
      `,
    };

    await sgMail.send(emailPayload);

    return updatedTask._id;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

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
    const deletedTask = await TaskModel.updateOne(
      { _id, status: 'active' },
      { $set: { status: 'deleted', deleted_at: new Date() } }
    );

    // *************** Handle case if Task not found or already deleted
    if (deletedTask.matchedCount === 0) {
      throw new ApolloError(
        'Task not found or already deleted.',
        'TASK_NOT_FOUND'
      );
    }

    return _id;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

// *************** LOADER ***************

/**
 * Resolves the `test_id` field on a StudentTestResult document using DataLoader.
 *
 * @param {Object} parent - The parent object, expected to contain the `test_id` field.
 * @param {Object} context - GraphQL context object.
 * @param {Object} context.loaders - An object containing DataLoader instances.
 * @param {Function} context.loaders.TestLoader - DataLoader instance for loading Test documents by ID.
 *
 * @returns {Promise<Object|null>} The loaded Test document, or null if not found or ID is invalid.
 *
 * @throws {ApolloError} If `test_id` is not a valid MongoDB ObjectId or a DataLoader error occurs.
 */
async function test_id(parent, args, { loaders }) {
  // *************** sanity check to ensure parent.test_id is an array with elements before attempting to use DataLoader
  CommonValidator.ValidateObjectId(parent.test_id);

  const loadedTest = await loaders.TestLoader.load(String(parent.test_id));

  return loadedTest;
}

/**
 * Resolves the user associated with a Task using DataLoader.
 *
 * @async
 * @function user_id
 * @param {Object} parent - The parent Task object containing the `user_id`.
 * @param {Object} context - The GraphQL context object.
 * @param {Object} context.loaders - Contains all configured DataLoaders.
 * @param {Function} context.loaders.UserLoader - DataLoader for fetching User documents by ID.
 *
 * @returns {Promise<Object|null>} The resolved user document or null if not found.
 * @throws {ApolloError} If the `user_id` is not a valid MongoDB ObjectId.
 */
async function user_id(parent, args, { loaders }) {
  // *************** sanity check to ensure parent.user_id is an array with elements before attempting to use DataLoader
  CommonValidator.ValidateObjectId(parent.user_id);

  const loadedUser = await loaders.UserLoader.load(String(parent.user_id));

  return loadedUser;
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
  Task: {
    test_id: test_id,
    user_id: user_id,
  },
};
