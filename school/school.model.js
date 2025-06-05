// *************** IMPORT CORE ***************
const mongoose = require("mongoose");

const SchoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    deleted_at: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("School", SchoolSchema);
