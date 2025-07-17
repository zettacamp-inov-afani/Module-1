// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema(
  {
    // Name of the subject
    name: { type: String, required: true, unique: true },

    // Description of the subject
    description: { type: String, required: true },

    // Coefficient of the subject
    coefficient: { type: Number, required: true, min: 0 },

    // Block reference of Subject
    block_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'block',
      required: true,
    },

    // Tests reference of Subject
    test_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'test',
      },
    ],

    // Passing criteria of Subject
    criteria: [
      {
        // The expected goal of subject's criteria
        goal: {
          type: String,
          enum: ['PASS', 'FAIL'],
          required: true,
        },
        // Rule of block's criteria
        rules: [
          {
            // Logical operator for subject's rule
            logical_operator: {
              type: String,
              enum: ['AND', 'OR'],
              required: true,
            },
            // Operator for subject's rule
            operator: {
              type: String,
              enum: ['GT', 'GTE', 'LT', 'LTE', 'EQ'],
              required: true,
            },
            // Type for subject's rule
            type: {
              type: String,
              enum: ['total_mark', 'test_result'],
              required: true,
            },
            // Reference to test for subject's rule
            test_id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'test',
              required: true,
            },
            // Value for subject's rule
            value: {
              type: Number,
              required: true,
            },
          },
        ],
      },
    ],

    // Status of subject
    subject_status: {
      type: String,
      enum: ['active', 'deleted'],
      default: 'active',
    },

    // Subject's delete_at detail
    deleted_at: { type: Date, default: null },
  },
  {
    // Subject's timestamps
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('subject', SubjectSchema);
