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
 * Creates a new Subject and links it to an existing active Block.
 *
 * @param {Object} _ - Unused parent resolver argument.
 * @param {Object} input - Object containing subject creation input.
 * @param {string} input.name - Name of the subject.
 * @param {string} input.description - Description of the subject.
 * @param {number} input.coefficient - Coefficient value of the subject.
 * @param {string} input.block_id - The ID of the Block to associate with.
 * @param {string[]} [input.test_ids] - Optional array of associated Test IDs.
 *
 * @returns {Promise<Object>} The newly created Subject document.
 *
 * @throws {ApolloError} If the Block is not found or already deleted, or any other error occurs.
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
 * Updates an existing subject with the provided input fields.
 *
 * @async
 * @function UpdateSubject
 * @param {Object} _ - Unused parent resolver argument (ignored).
 * @param {string} _id - The ID of the subject to update.
 * @param {Object} input - Updated subject data.
 * @param {string} input.name - Updated name of the subject.
 * @param {string} [input.description] - Updated description of the subject (optional).
 * @param {number} input.coefficient - Updated coefficient (must be ≥ 0).
 * @param {string} input.block_id - The ID of the associated Block.
 * @param {string[]} [input.test_ids] - Updated array of associated Test IDs (optional).
 * @returns {Promise<Object>} The updated subject document.
 * @throws {ApolloError} Throws if subject ID is invalid, subject not found, or update fails.
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
    const deletedSubject = await SubjectModel.updateOne(
      { _id, subject_status: 'active' },
      { $set: { subject_status: 'deleted', deleted_at: new Date() } }
    );

    // *************** Handle case if Subject not found or already deleted
    if (deletedSubject.matchedCount === 0) {
      throw new ApolloError(
        'Subject not found or already deleted.',
        'SUBJECT_NOT_FOUND'
      );
    }

    // *************** Delete subject from relate block
    await BlockModel.updateOne(
      { block_id: deletedSubject.block_id },
      { $pull: { subject_ids: _id } }
    );

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
 * Field resolver to load the Block associated with a StudentTestResult using DataLoader.
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
