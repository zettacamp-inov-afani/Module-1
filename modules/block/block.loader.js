// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');

// *************** IMPORT MODULE ***************
const BlockModel = require('./block.model');

// *************** IMPORT VALIDATOR ***************
const CommonValidator = require('../../utilities/validator');

/**
 * Creates a DataLoader instance to batch and cache Block lookups by their IDs.
 *
 * This function performs the following operations:
 * - Validates the incoming array of `block_id`s to ensure they are valid MongoDB ObjectIds.
 * - Queries the database for all Block documents that match the provided IDs.
 * - Constructs a mapping (`blockMap`) from each ID to its corresponding Block document.
 * - Returns the Block documents in the same order as the input `block_id` array.
 *
 * This loader helps optimize performance by preventing N+1 query problems in GraphQL resolvers.
 *
 * @returns {DataLoader<string, Object|null>} A DataLoader instance for resolving Blocks by ID.
 *
 * @throws {ApolloError} If the provided block IDs are invalid.
 */
function BlockLoader() {
  // *************** Create new instance of DataLoader
  return new DataLoader(async (block_id) => {
    // ***************  Validate the incoming block ids
    CommonValidator.ValidateMongoObjectIds(block_id);

    // *************** Find all Blocks whose id is in the block ids array
    const blocks = await BlockModel.find({
      _id: { $in: block_id },
    }).lean();

    // *************** Create blockMap object for dictionary
    const blockMap = {};
    blocks.forEach((block) => {
      blockMap[String(block._id)] = block;
    });

    // *************** Return an array containing blocks in the order of the requested block ids.
    const orderedBlocks = block_id.map((_id) => blockMap[String(_id)]);
    return orderedBlocks;
  });
}

// *************** EXPORT MODULE ***************
module.exports = BlockLoader;
