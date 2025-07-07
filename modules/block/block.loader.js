// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');

// *************** IMPORT MODULE ***************
const BlockModel = require('./block.model');

// *************** IMPORT VALIDATOR ***************
const CommonValidator = require('../../utilities/validator');

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
