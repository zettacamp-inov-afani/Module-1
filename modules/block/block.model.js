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

    // Passing criteria of Block
    criteria: [
      {
        // The expected goal of block's criteria
        goal: {
          type: String,
          enum: ['PASS', 'FAIL'],
          required: true,
        },
        // Rule of block's criteria
        rules: [
          {
            // Logical operator for block's rule
            logical_operator: {
              type: String,
              enum: ['AND', 'OR'],
              required: true,
            },
            // Operator for block's rule
            operator: {
              type: String,
              enum: ['GT', 'GTE', 'LT', 'LTE', 'EQ'],
              required: true,
            },
            // Type for block's rule
            type: {
              type: String,
              enum: ['total_mark', 'subject_result'],
              required: true,
            },
            // Reference to subject for block's rule
            subject_id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'subject',
            },
            // Reference to test for block's rule
            test_id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'test',
            },
            // Value for block's rule
            value: {
              type: Number,
              required: true,
            },
          },
        ],
      },
    ],
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
