// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const BlockModel = require('./block.model');

// *************** IMPORT VALIDATORS ***************
const ValidateBlockInput = require('./block.validator');
const CommonValidator = require('../../utilities/validator');
const { Query } = require('mongoose');

// *************** QUERY ***************

async function GetOneBlock(_, { _id }) {
  try {
    // *************** Validate the input ID
    CommonValidator.ValidateObjectId(_id, 'Block ID');

    // *************** Find student by ID and check if status is active
    const block = await BlockModel.findOne({
      _id: _id,
      status: 'active',
    }).lean();

    // *************** Handle case if School not found or already deleted
    if (!block) {
      throw new ApolloError(
        'Block not found or already deleted.',
        'BLOCK_NOT_FOUND'
      );
    }
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

module.exports = {
  Query: {
    GetOneBlock,
  },
};
