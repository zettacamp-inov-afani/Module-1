// *************** IMPORT CORE ***************
const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * Logs success or failure status to the console.
 *
 * @async
 * @function ConnectDB
 * @returns {Promise<void>} - Resolves when the database is connected successfully.
 */
async function ConnectDB() {
  try {
    // *************** Attempt to connect to MongoDB using mongoose.connect with options
    const uri = `mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`;
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // *************** Log a success message if connection is successful
    console.log('MongoDB connected');
  } catch (error) {
    // *************** Log the error message if the connection fails
    console.error('MongoDB connection failed:', error);

    // *************** Exit the process with an error code
    process.exit(1);
  }
}

// *************** EXPORT MODULE ***************
module.exports = ConnectDB;
