// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  // detail of the address
  detail: { type: String, required: true },

  // city of the address
  city: { type: String, required: true },

  // country of the address
  country: { type: String, required: true },

  // zipcode of the address
  zipcode: { type: String, required: true },
});

const SchoolSchema = new mongoose.Schema(
  {
    // Long name of the school
    long_name: { type: String, required: true, unique: true },

    // Short name of the school
    short_name: { type: String, required: true, unique: true },

    // School addresses
    addresses: [AddressSchema],

    // Student connected
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true,
      },
    ],

    // Check stasuses
    status: {
      type: String,
      enum: ['active', 'deleted'],
      default: 'active',
    },

    // School's delete_at detail
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
module.exports = mongoose.model('school', SchoolSchema);
