// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    // Test reference of task
    test_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'test',
        required: true,
      },
    ],

    // User reference of task
    user_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
      },
    ],

    // Task type
    task_type: {
      type: String,
      enum: ['Assign Corrector', 'Enter Marks', 'validate Marks'],
      default: 'Assign Corrector',
    },

    // Task status
    task_status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },

    // Optional due date for the task
    due_date: {
      type: Date,
      default: null,
    },

    // Task's delete_at detail
    delete_at: { type: Date, default: null },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('task', TaskSchema);
