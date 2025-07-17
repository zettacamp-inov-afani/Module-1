// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema(
  {
    // Name of the test
    name: { type: String, required: true, unique: true },

    // Description of the test
    description: { type: String, required: true },

    // Weight of the test
    weight: { type: Number, required: true, min: 0 },

    // Notations of test
    notations: [
      {
        notation_text: { type: String, required: true },
        max_points: { type: Number, required: true, min: 0 },
      },
    ],

    // Set the published date
    published_date: { type: Date, default: null },

    // Subject reference of test
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'subject',
      required: true,
    },

    // Status of test
    test_status: {
      type: String,
      enum: ['active', 'deleted'],
      default: 'active',
    },

    // Passing criteria of Test
    criteria: [
      {
        // The expected goal of test's criteria
        goal: {
          type: String,
          enum: ['PASS', 'FAIL'],
          required: true,
        },
        // Rule of test's criteria
        rules: [
          {
            // Logical operator for test's rule
            logical_operator: {
              type: String,
              enum: ['AND', 'OR'],
              required: true,
            },
            // Operator for test's rule
            operator: {
              type: String,
              enum: ['GT', 'GTE', 'LT', 'LTE', 'EQ'],
              required: true,
            },
            // Value for test's rule
            value: {
              type: Number,
              required: true,
            },
          },
        ],
      },
    ],

    // Test's delete_at detail
    deleted_at: { type: Date, default: null },
  },
  {
    // Test's timestamps
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('test', TestSchema);
