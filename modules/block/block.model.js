// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

const BlockSchema = new mongoose.Schema(
  {
    // Name of the block
    name: { type: String, required: true, unique: true },

    // Description of the block
    description: { type: String, required: true },

    // Subject reference of Block
    subject_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
      },
    ],

    // Status of block
    block_status: {
      type: String,
      enum: ['active', 'deleted'],
      default: 'active',
    },

    // Block's delete_at detail
    deleted_at: { type: Date, default: null },
  },
  {
    // Block's timestamps
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('block', BlockSchema);
