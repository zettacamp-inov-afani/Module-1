// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema(
  {
    // Name of the test
    name: { type: String, required: true, unique: true },

    // Description of the test
    description: { type: String, required: true, unique: true },

    // Weight of the test
    weight: { type: Number, required: true, min: 0 },

    // Notations of test
    notations: [
      {
        notation_text: { type: String, required: true, unique: true },
        max_points: { type: Number, required: true, min: 0 },
      },
    ],

    // Set the published date
    published_date: { type: Date, default: null },

    // Subject reference of test
    subject_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true,
      },
    ],

    // Test status
    test_status: {
      type: String,
      enum: ['active', 'deleted'],
      default: 'active',
    },

    // Test's delete_at detail
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
module.exports = mongoose.model('test', TestSchema);
