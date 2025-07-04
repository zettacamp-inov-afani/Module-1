// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

const BlockSchema = new mongoose.Schema(
  {
    // Name of the block
    name: { type: String, required: true, unique: true },

    // Description of the block
    description: { type: String, required: true, unique: true },

    // Subject reference
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true,
      },
    ],

    // Block status
    block_status: {
      type: String,
      enum: ['active', 'deleted'],
      default: 'active',
    },

    // Block's delete_at detail
    delete_at: { type: Date, default: null },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

module.exports = mongoose.model('block', BlockSchema);
