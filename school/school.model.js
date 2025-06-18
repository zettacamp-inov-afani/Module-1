// *************** IMPORT CORE ***************
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  // detail of the address
  detail: { type: String, required: true },

  // city of the address
  city: { type: String, required: true },

  // country of the address
  country: { type: String, required: true },

  // zipcode of the address
  zipcode: { type: String, required: true },
});

const schoolSchema = new mongoose.Schema(
  {
    // Long name of the school
    long_name: { type: String, required: true },

    // Short name of the school
    short_name: { type: String, required: true },

    // School addresses
    addresses: [addressSchema],

    // Student connected
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'students',
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

const SchoolModel = mongoose.model('schools', schoolSchema);

// *************** EXPORT MODULE ***************
module.exports = SchoolModel;
