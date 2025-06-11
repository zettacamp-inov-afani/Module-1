// config/db.js
const mongoose = require("mongoose");

/**
 * Connects to the MongoDB database.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 */
async function connectDB() {
  try {
    await mongoose.connect("mongodb://localhost:27017/zettaschool", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    mongoose.set("debug", true);

    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1); // keluar jika gagal connect
  }
}

module.exports = connectDB;
