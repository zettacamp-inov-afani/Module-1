// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    // Civility of the student
    civility: {
      type: String,
      enum: ['Mr', 'Mrs'],
      required: true,
    },

    // User first name
    first_name: { type: String, required: true },

    // User last name
    last_name: { type: String, required: true },

    // User's email
    email: { type: String, required: true, unique: true },

    // User's password
    password: { type: String, required: true },

    // User's role
    role: {
      type: String,
      enum: ['admin', 'acadir', 'corrector'],
      default: 'admin',
    },

    // User's statuses
    status: {
      type: String,
      enum: ['active', 'deleted'],
      default: 'active',
    },

    // User's delete_at detail
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
module.exports = mongoose.model('user', UserSchema);
