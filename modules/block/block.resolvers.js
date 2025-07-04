// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const BlockModel = require('./block.model');

// *************** IMPORT VALIDATORS ***************
const ValidateBlockInput = require('./block.validator');
const CommonValidator = require('../../utilities/validator');

// *************** QUERY ***************

/**
 * GetOneBlock resolver to retrieve a single active Block document by its _id.
 *
 * @param {object} _ - Unused first argument (parent resolver), required by GraphQL resolver signature.
 * @param {object} args - The arguments object containing the _id of the Block to retrieve.
 * @param {string} args._id - The MongoDB ObjectId of the Block to fetch.
 * @returns {Promise<object>} - A Promise that resolves to the Block document if found and active.
 *
 * @throws {ApolloError} - Throws BLOCK_NOT_FOUND if no matching Block is found or if it has been deleted.
 * @throws {ApolloError} - Throws a generic ApolloError if other errors occur.
 */
async function GetOneBlock(_, { _id }) {
  try {
    // *************** Validate Block ID
    CommonValidator.ValidateObjectId(_id, 'Block ID');

    // *************** Find block by ID and check if status is active
    const block = await BlockModel.findOne({
      _id: _id,
      status: 'active',
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
 * @param {object} _ - Unused first argument (parent resolver), required by GraphQL resolver signature.
 * @param {object} args - GraphQL arguments object (currently unused).
 * @returns {Promise<object[]>} - A Promise that resolves to an array of active Block documents.
 *
 * @throws {ApolloError} - Throws an ApolloError if any error occurs during the operation.
 */
async function GetAllBlocks(_, args) {
  try {
    // *************** Retrieve all blocks with status 'active'
    const blocks = await BlockModel.find({
      status: 'active',
    }).lean();

    // *************** return the result
    return blocks;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

// *************** MUTATION ***************

/**
 * CreateBlock resolver to create a new Block document with the provided input.
 *
 * @param {object} _ - Unused parent resolver argument, required by GraphQL resolver signature.
 * @param {object} args - The arguments object containing input for the new Block.
 * @param {object} args.input - The input data to create the Block.
 * @param {string} args.input.name - The name of the Block.
 * @param {string} args.input.description - The description of the Block.
 * @param {string[]} args.input.subject_ids - An array of Subject IDs associated with the Block.
 * @returns {Promise<object>} - A Promise that resolves to the newly created Block document.
 *
 * @throws {ApolloError} - Throws an ApolloError if validation fails or creation encounters an error.
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
      block_status: 'active',
    });

    // *************** return the result
    return createBlock;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

/**
 * UpdateBlock resolver to update an existing active Block document by its _id.
 *
 * @param {object} _ - Unused parent resolver argument, required by GraphQL resolver signature.
 * @param {object} args - Arguments object containing the _id of the Block and input fields to update.
 * @param {string} args._id - The MongoDB ObjectId of the Block to update.
 * @param {object} args.input - The input fields for updating the Block.
 * @param {string} args.input.name - The updated name of the Block.
 * @param {string} args.input.description - The updated description of the Block.
 * @param {string[]} args.input.subject_ids - The updated array of Subject IDs.
 * @returns {Promise<object>} - A Promise that resolves to the updated Block document.
 *
 * @throws {ApolloError} - Throws BLOCK_NOT_FOUND if no active Block is found with the given _id.
 * @throws {ApolloError} - Throws a generic ApolloError if validation or update fails.
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
    };

    const updatedBlock = await BlockModel.findOneAndUpdate(
      { _id: _id, status: 'active' },
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
 * @param {object} args - Arguments object containing the _id of the Block to delete.
 * @param {string} args._id - The MongoDB ObjectId of the Block to soft-delete.
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
    const deletedBlock = await BlockModel.findOneAndUpdate(
      { _id, status: 'active' },
      { $set: { status: 'deleted', deleted_at: new Date() } }
    );

    // *************** Handle case if School not found or already deleted
    if (!deletedBlock) {
      throw new ApolloError(
        'Block not found or already deleted.',
        'BLOCK_NOT_FOUND'
      );
    }

    // *************** Return the _id
    return _id;
  } catch (error) {
    throw new ApolloError(error.message);
  }
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
};
