// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const BlockModel = require('./block.model');
const SubjectModel = require('../subject/subject.model');

// *************** IMPORT VALIDATOR ***************
const ValidateBlockInput = require('./block.validator');
const CommonValidator = require('../../utilities/validator');

// *************** QUERY ***************

/**
 * Retrieves a single active Block by its ID.
 *
 * This function validates the provided Block ID, fetches the corresponding
 * Block document from the database if its `block_status` is 'active',
 * and returns it. If not found or already deleted, throws an error.
 *
 * @param {Object} _ - Unused first resolver argument (parent/root).
 * @param {string} _id - The ID of the Block to retrieve.
 * @returns {Promise<Object>} The Block document if found and active.
 *
 * @throws {ApolloError} If the ID is invalid or the Block is not found or already deleted.
 */
async function GetOneBlock(_, { _id }) {
  try {
    // *************** Validate Block ID
    CommonValidator.ValidateObjectId(_id, 'Block ID');

    // *************** Find block by ID and check if status is active
    const block = await BlockModel.findOne({
      _id: _id,
      block_status: 'active',
    }).lean();

    // *************** Handle case if Block not found or already deleted
    if (!block) {
      throw new ApolloError(
        'Block not found or already deleted.',
        'BLOCK_NOT_FOUND'
      );
    }

    // *************** return the result
    return block;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * GetAllBlocks resolver to retrieve all Block documents with status 'active'.
 *
 * @returns {Promise<object[]>} - A Promise that resolves to an array of active Block documents.
 * @throws {ApolloError} - Throws an ApolloError if any error occurs during the operation.
 */
async function GetAllBlocks() {
  try {
    // *************** Retrieve all blocks with status 'active'
    const blocks = await BlockModel.find({
      block_status: 'active',
    }).lean();

    // *************** return the result
    return blocks;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new Block document in the database.
 *
 * This function validates the input, constructs a new Block with the provided
 * name, description, subject_ids, and dynamic criteria, and sets its initial
 * status to `'active'`.
 *
 * @async
 * @function CreateBlock
 * @param {object} _ - Unused parent resolver argument.
 * @param {object} input - Input object containing block creation data.
 * @param {string} input.name - The name of the block.
 * @param {string} [input.description] - Optional description of the block.
 * @param {Array<string>} input.subject_ids - Array of Subject ObjectId strings assigned to this block.
 * @param {Array<Object>} input.criteria - Array of dynamic criteria groups for passing evaluation.
 * @returns {Promise<Object>} The newly created Block document.
 * @throws {ApolloError} If validation fails or the database operation encounters an error.
 */
async function CreateBlock(_, { input }) {
  try {
    // *************** Validate required input
    ValidateBlockInput(input);

    // *************** Create a new Block instance
    const createBlock = await BlockModel.create({
      name: input.name,
      description: input.description,
      subject_ids: input.subject_ids,
      criteria: input.criteria,
      block_status: 'active',
    });

    // *************** return the result
    return createBlock;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * Updates an existing Block document by its ID.
 *
 * This function first validates the provided Block ID and input fields.
 * If a matching active Block is found, it updates the name, description,
 * subject_ids, and criteria fields. Returns the updated Block document.
 *
 * @async
 * @function UpdateBlock
 * @param {object} _ - Unused parent resolver argument.
 * @param {string} _id - The ID of the Block to update (must be a valid MongoDB ObjectId).
 * @param {object} input - The new data for the Block.
 * @param {string} input.name - The updated name of the Block.
 * @param {string} [input.description] - Optional updated description of the Block.
 * @param {Array<string>} input.subject_ids - Updated array of Subject ObjectId strings.
 * @param {Array<Object>} input.criteria - Updated dynamic passing criteria.
 * @returns {Promise<Object>} The updated Block document.
 * @throws {ApolloError} If validation fails, the block is not found, or any other error occurs during the operation.
 */
async function UpdateBlock(_, { _id, input }) {
  try {
    // *************** Validate Block ID (must be valid MongoDB ObjectId)
    CommonValidator.ValidateObjectId(_id, 'Block ID');

    // *************** Validate block input
    ValidateBlockInput(input);

    const updateFields = {
      name: input.name,
      description: input.description,
      subject_ids: input.subject_ids,
      criteria: input.criteria,
    };

    const updatedBlock = await BlockModel.findOneAndUpdate(
      { _id: _id, block_status: 'active' },
      { $set: updateFields },
      { new: true }
    ).lean();

    // *************** Handle case if Block not found or already deleted
    if (!updatedBlock) {
      throw new ApolloError(
        'Block not found or already deleted.',
        'BLOCK_NOT_FOUND'
      );
    }

    return updatedBlock;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * DeleteBlock resolver to soft-delete a Block by updating its status to 'deleted'.
 *
 * @param {object} _ - Unused parent resolver argument, required by GraphQL resolver signature.
 * @param {string} _id - The MongoDB ObjectId of the Block to soft-delete.
 * @returns {Promise<string>} - A Promise that resolves to the _id of the deleted Block.
 *
 * @throws {ApolloError} - Throws BLOCK_NOT_FOUND if no active Block is found with the given _id.
 * @throws {ApolloError} - Throws a generic ApolloError if deletion fails.
 */
async function DeleteBlock(_, { _id }) {
  try {
    // *************** Validate required input field
    CommonValidator.ValidateObjectId(_id, 'Block ID');

    // *************** Find the Block with the given ID and "active" status, then update it to "deleted"
    const deletedBlock = await BlockModel.updateOne(
      { _id, block_status: 'active' },
      { $set: { block_status: 'deleted', deleted_at: new Date() } }
    );

    // *************** Handle case if Block not found or already deleted
    if (deletedBlock.matchedCount === 0) {
      throw new ApolloError(
        'Block not found or already deleted.',
        'BLOCK_NOT_FOUND'
      );
    }

    // *************** Soft delete all Subjects under this Block
    await SubjectModel.updateMany(
      { block_id: _id, subject_status: 'active' },
      { $set: { subject_status: 'deleted', deleted_at: new Date() } }
    );

    // *************** Return the _id
    return _id;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

// *************** LOADER ***************

/**
 * Resolves the list of Subject documents associated with a parent entity via DataLoader.
 *
 * This function:
 * - Validates that the `subject_ids` field in the parent is a valid array of MongoDB ObjectIds.
 * - Uses DataLoader (`SubjectLoader`) to batch and cache retrieval of the subjects.
 *
 * @param {Object} parent - The parent object containing the array of subject_ids.
 * @param {Object} context - GraphQL context object.
 * @param {Object} context.loaders - Context object that holds all DataLoaders.
 * @param {Function} context.loaders.SubjectLoader - DataLoader function for fetching subjects by ID.
 *
 * @returns {Promise<Object[]>} - A promise that resolves to an array of subject documents.
 *
 * @throws {ApolloError} - If subject_ids is invalid or not an array of valid MongoDB ObjectIds.
 */
async function subject_ids(parent, args, { loaders }) {
  // *************** sanity check to ensure parent.subject_ids is an array with elements before attempting to use DataLoader
  CommonValidator.ValidateMongoObjectIds(parent.subject_ids);

  // *************** Load subjects via DataLoader
  const loadedSubjects = await loaders.SubjectLoader.loadMany(
    parent.subject_ids.map((id) => String(id))
  );

  return loadedSubjects;
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetOneBlock,
    GetAllBlocks,
  },
  Mutation: {
    CreateBlock,
    UpdateBlock,
    DeleteBlock,
  },
  Block: {
    subject_ids: subject_ids,
  },
};
