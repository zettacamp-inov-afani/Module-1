// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

const CalculationResultSchema = new mongoose.Schema(
  {
    // Student reference of CalculationResult
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'student',
      required: true,
    },

    // Overall result of the student
    overall_result: {
      type: String,
      enum: ['PASS', 'FAIL'],
      required: true,
    },

    // Detail of the results of CalculationResult
    results: [
      {
        block_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'block',
          required: true,
        },
        block_result: {
          type: String,
          enum: ['PASS', 'FAIL'],
          required: true,
        },
        total_mark: {
          type: Number,
          required: true,
        },
        subject_results: [
          {
            subject_id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'subject',
              required: true,
            },
            subject_result: {
              type: String,
              enum: ['PASS', 'FAIL'],
              required: true,
            },
            total_mark: {
              type: Number,
              required: true,
            },
            test_results: [
              {
                test_id: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: 'test',
                  required: true,
                },
                test_result: {
                  type: String,
                  enum: ['PASS', 'FAIL'],
                  required: true,
                },
                average_mark: {
                  type: Number,
                  required: true,
                },
                weighted_mark: {
                  type: Number,
                  required: true,
                },
              },
            ],
          },
        ],
      },
    ],

    // CalculationResult's delete_at detail
    deleted_at: { type: Date, default: null },

    calculation_result_status: {
      type: String,
      enum: ['active', 'deleted'],
      default: 'active',
    },
  },
  {
    // CalculationResult's timestamps
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('calculationResult', CalculationResultSchema);
