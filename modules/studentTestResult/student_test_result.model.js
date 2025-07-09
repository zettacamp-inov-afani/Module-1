// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

const StudentTestResultSchema = new mongoose.Schema(
  {
    // Student reference of Student Test Result
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'student',
      required: true,
    },

    // Test reference of Student Test Result
    test_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'test',
      required: true,
    },

    // Marks for Student Test Result
    marks: [
      {
        notation_text: { type: String, required: true, unique: true },
        mark: { type: Number, required: true, min: 0 },
      },
    ],

    // Average mark for Student Test Result
    average_mark: {
      type: Number,
      required: true,
      min: 0,
    },

    // Mark entry date for Student Test Result
    mark_entry_date: {
      type: Date,
      default: Date.now,
    },

    // Mark validate date for Student Test Result
    mark_validate_date: {
      type: Date,
      default: null,
    },

    // Status of Student Test Result
    student_test_result_status: {
      type: String,
      enum: ['active', 'deleted'],
      default: 'active',
    },

    // Student Test Result's delete_at detail
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('studentTestResult', StudentTestResultSchema);
