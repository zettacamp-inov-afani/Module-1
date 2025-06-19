// *************** IMPORT MODULE ***************
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    // Civility of the student
    civility: {
      type: String,
      enum: ['Mr', 'Mrs'],
      required: true,
    },
    // First name of the student
    first_name: { type: String, required: true },

    // Last name of the student
    last_name: { type: String, required: true },

    // Email of the student
    email: { type: String, required: true, unique: true },

    // Telephone of the student
    tele_phone: { type: String, required: true, unique: true },

    // Date of birth of the student
    date_of_birth: { type: Date },

    // Place of birth of the student
    place_of_birth: { type: String, required: true },

    // Postal code of birth of the student
    postal_code_of_birth: { type: String, required: true },

    // School ref
    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'school',
      required: true,
    },

    // Status check
    status: {
      type: String,
      enum: ['active', 'deleted'],
      default: 'active',
    },

    // Student's delete_at detail
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

const StudentModel = mongoose.model('student', studentSchema);

// *************** EXPORT MODULE ***************
module.exports = StudentModel;
