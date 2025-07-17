// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const SubjectModel = require('./subject.model');
const BlockModel = require('../block/block.model');
const TestModel = require('../test/test.model');

// *************** IMPORT VALIDATOR ***************
const ValidateSubjectInput = require('./subject.validator');
const CommonValidator = require('../../utilities/validator');

// *************** QUERY ***************

/**
 * Retrieves a single active subject by its ID.
 *
 * @async
 * @function GetOneSubject
 * @param {Object} _ - Unused parent resolver argument (ignored).
 * @param {string} _id - The ID of the subject to retrieve.
 * @returns {Promise<Object>} The subject document if found and active.
 * @throws {ApolloError} Throws an error if the ID is invalid, subject is not found,
 *                       or another error occurs during retrieval.
 */
async function GetOneSubject(_, { _id }) {
  try {
    // *************** Validate Subject ID
    CommonValidator.ValidateObjectId(_id, 'Subject ID');

    // *************** Find subject by ID and check if status is active
    const subject = await SubjectModel.findOne({
      _id: _id,
      subject_status: 'active',
    }).lean();

    // *************** Handle case if Subject not found or already deleted
    if (!subject) {
      throw new ApolloError(
        'Subject not found or already deleted.',
        'SUBJECT_NOT_FOUND'
      );
    }

    // *************** Return the result
    return subject;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * Retrieves all subjects with the status 'active'.
 *
 * @async
 * @function GetAllSubjects
 * @returns {Promise<Object[]>} A list of active subject documents.
 * @throws {ApolloError} Throws an error if retrieval fails.
 *
 */
async function GetAllSubjects() {
  try {
    // *************** Retrieve all subjects with status 'active'
    const subjects = await SubjectModel.find({
      subject_status: 'active',
    }).lean();

    // *************** return the result
    return subjects;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new Subject and associates it with a Block.
 *
 * This function validates the input, ensures the referenced Block exists and is active,
 * creates a new Subject document, and updates the Block to include the new Subject's ID.
 *
 * @async
 * @function CreateSubject
 * @param {object} _ - Unused parent resolver argument.
 * @param {object} input - The input data to create the Subject.
 * @param {string} input.name - The name of the Subject.
 * @param {string} [input.description] - Optional description of the Subject.
 * @param {number} input.coefficient - The coefficient used for transcript weight calculation.
 * @param {string} input.block_id - The ID of the Block to which the Subject belongs.
 * @param {Array<string>} [input.test_ids] - Optional array of Test ObjectId strings related to the Subject.
 * @param {Array<object>} [input.criteria] - Optional dynamic passing criteria for the Subject.
 * @returns {Promise<object>} The newly created Subject document.
 * @throws {ApolloError} If validation fails, the referenced Block is not found, or an error occurs during creation.
 */
async function CreateSubject(_, { input }) {
  try {
    // *************** Validate required input
    ValidateSubjectInput(input);

    // *************** Check if the block is active
    const block = await BlockModel.findOne({
      _id: input.block_id,
      block_status: 'active',
    }).lean();

    if (!block) {
      throw new ApolloError(
        'Block not found or already deleted.',
        'BLOCK_NOT_FOUND'
      );
    }

    // *************** Create a new Subject instance
    const createSubject = await SubjectModel.create({
      name: input.name,
      description: input.description,
      coefficient: input.coefficient,
      block_id: input.block_id,
      test_ids: input.test_ids,
      criteria: input.criteria,
    });

    // *************** Add the new subject's ID to the corresponding Block's `subjects` array
    await BlockModel.updateOne(
      { _id: input.block_id, block_status: 'active' },
      { $addToSet: { subject_ids: createSubject._id } }
    );

    // *************** return the result
    return createSubject;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * Updates an existing Subject by its ID.
 *
 * This function validates the subject ID and input fields, then updates the subject document
 * if it is still active. It returns the updated subject data if successful.
 *
 * @async
 * @function UpdateSubject
 * @param {string} _id - The ID of the Subject to update.
 * @param {object} input - The input data to update the Subject.
 * @param {string} input.name - The updated name of the Subject.
 * @param {string} [input.description] - Optional updated description of the Subject.
 * @param {number} input.coefficient - The updated coefficient for transcript weight.
 * @param {string} input.block_id - The ID of the associated Block.
 * @param {Array<string>} [input.test_ids] - Optional array of updated Test ObjectId strings.
 * @param {Array<object>} [input.criteria] - Optional updated dynamic passing criteria.
 * @returns {Promise<object>} The updated Subject document.
 * @throws {ApolloError} If validation fails, the Subject is not found or inactive, or a database error occurs.
 */
async function UpdateSubject(_, { _id, input }) {
  try {
    // *************** Validate subject ID (must be valid MongoDB ObjectId)
    CommonValidator.ValidateObjectId(_id, 'Subject ID');

    // *************** Validate subject input
    ValidateSubjectInput(input);

    const updateFields = {
      name: input.name,
      description: input.description,
      coefficient: input.coefficient,
      block_id: input.block_id,
      test_ids: input.test_ids,
      criteria: input.criteria,
    };

    // *************** Update the subject data if active
    const updatedSubject = await SubjectModel.findOneAndUpdate(
      { _id: _id, subject_status: 'active' },
      { $set: updateFields },
      { new: true }
    ).lean();

    // *************** Handle case if Subject not found or already deleted
    if (!updatedSubject) {
      throw new ApolloError(
        'Subject not found or already deleted.',
        'SUBJECT_NOT_FOUND'
      );
    }

    // *************** Return the updated data
    return updatedSubject;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * Soft deletes a subject and removes its reference from the related block.
 *
 * Updates the subject's status to "deleted" and removes its ID from the block's subject list.
 *
 * @returns {string} The ID of the deleted subject.
 * @throws {ApolloError} If validation fails or the subject is not found.
 */
async function DeleteSubject(_, { _id }) {
  try {
    // *************** Validate the subject id
    CommonValidator.ValidateObjectId(_id, 'Subject ID');

    // *************** Find the Subject with the given ID and "active" status, then update it to "deleted"
    const deletedSubject = await SubjectModel.findOneAndUpdate(
      { _id, subject_status: 'active' },
      { $set: { subject_status: 'deleted', deleted_at: new Date() } }
    );

    // *************** Handle case if Subject not found or already deleted
    if (!deletedSubject) {
      throw new ApolloError(
        'Subject not found or already deleted.',
        'SUBJECT_NOT_FOUND'
      );
    }

    // *************** Delete subject from relate block
    const blockUpdate = await BlockModel.updateOne(
      { _id: deletedSubject.block_id },
      { $pull: { subject_ids: _id } }
    );

    if (!blockUpdate || blockUpdate.matchedCount === 0) {
      throw new ApolloError(
        'Failed to update Block, block not found or already updated.',
        'BLOCK_UPDATE_FAILED'
      );
    }

    // *************** Soft delete all Tests under this Block
    await TestModel.updateMany(
      { subject_id: _id, test_status: 'active' },
      { $set: { test_status: 'deleted', deleted_at: new Date() } }
    );

    // *************** Return the _id
    return _id;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

// *************** LOADER ***************

/**
 * Field resolver to load the Block associated with a Subject using DataLoader.
 *
 * @param {Object} parent - The parent object that contains the `block_id` field.
 * @param {Object} context - GraphQL context object.
 * @param {Object} context.loaders - Contains configured DataLoaders.
 * @returns {Promise<Object>} The Block document corresponding to the given block_id.
 *
 * @throws {ApolloError} If the block_id is invalid or loading fails.
 */
async function block_id(parent, args, { loaders }) {
  // *************** sanity check to ensure parent.block_id is an array with elements before attempting to use DataLoader
  CommonValidator.ValidateObjectId(parent.block_id);

  const loadedBlock = await loaders.BlockLoader.load(String(parent.block_id));

  return loadedBlock;
}

/**
 * Field resolver to load multiple Test documents associated with a parent object using DataLoader.
 *
 * @param {Object} parent - The parent object that contains the `test_ids` array.
 * @param {Object} context - GraphQL context object.
 * @param {Object} context.loaders - Contains configured DataLoaders.
 * @returns {Promise<Array<Object>>} An array of Test documents corresponding to the given test_ids.
 *
 * @throws {ApolloError} If the test_ids are invalid or loading fails.
 */
async function test_ids(parent, args, { loaders }) {
  // *************** sanity check to ensure parent.test_ids is an array with elements before attempting to use DataLoader
  CommonValidator.ValidateMongoObjectIds(parent.test_ids);

  const loadedTests = await loaders.TestLoader.loadMany(
    parent.test_ids.map((id) => String(id))
  );

  return loadedTests;
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetOneSubject,
    GetAllSubjects,
  },
  Mutation: {
    CreateSubject,
    UpdateSubject,
    DeleteSubject,
  },
  Subject: {
    block_id: block_id,
    test_ids: test_ids,
  },
};
