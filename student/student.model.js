// *************** IMPORT CORE ***************
const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    date_of_birth: { type: Date },
    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    status: {
      type: String,
      enum: ["is_active", "deleted"],
      default: "is_active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", StudentSchema);
