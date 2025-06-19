// *************** IMPORT MODULE ***************
require('dotenv').config();

const envs = {
  PORT: process.env.PORT,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
};

// *************** EXPORT MODULE ***************
module.exports = envs;
