// *************** IMPORT MODULE ***************
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    // Civility of the student
    civility: {
      type: String,
      enum: ["Mr", "Mrs"],
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
      ref: "School",
      required: true,
    },

    // Status check
    status: {
      type: String,
      enum: ["is_active", "deleted"],
      default: "is_active",
    },
  },
  { timestamps: true }
);

// *************** EXPORT MODULE ***************
module.exports = mongoose.model("Student", studentSchema);
