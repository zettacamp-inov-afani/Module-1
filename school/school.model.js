// *************** IMPORT CORE ***************
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  detail: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  zipcode: { type: Number, required: true },
});

const SchoolSchema = new mongoose.Schema(
  {
    // Long name of the school
    long_name: { type: String, required: true },

    // Short name of the school
    short_name: { type: String, required: true },

    // School addresses
    address: [addressSchema],

    // Student's reference
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],

    // Check stasuses
    status: {
      type: String,
      enum: ["is_active", "deleted"],
      default: "is_active",
    },
  },
  { timestamps: true }
);

// *************** EXPORT MODULE ***************
module.exports = mongoose.model("School", SchoolSchema);
