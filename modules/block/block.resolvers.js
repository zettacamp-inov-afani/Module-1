// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const BlockModel = require('./block.model');

// *************** IMPORT VALIDATORS ***************
const ValidateBlockInput = require('./block.validator');
const CommonValidator = require('../../utilities/validator');
const { Query } = require('mongoose');

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

    return blocks;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

module.exports = {
  Query: {
    GetOneBlock,
    GetAllBlocks,
  },
};
