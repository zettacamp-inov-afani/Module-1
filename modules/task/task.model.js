// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    // Test reference of task
    test_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'test',
      required: true,
    },

    // User reference of task
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },

    // Task type
    task_type: {
      type: String,
      enum: ['assign_corrector', 'enter_marks', 'validate_marks'],
      default: 'assign_corrector',
    },

    // Status of task
    task_status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },

    // Task's 'active' or 'deleted'
    status: {
      type: String,
      enum: ['active', 'deleted'],
      default: ['active'],
    },

    // Optional due date for the task
    due_date: {
      type: Date,
      default: null,
    },

    // Task's delete_at detail
    deleted_at: { type: Date, default: null },
  },
  {
    // Task's timestamps
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('task', TaskSchema);
