// *************** LOAD ENV ***************
require('dotenv').config();

/**
 * Helper to get environment variables with fallback and validation.
 *
 * @param {string} name - Name of the environment variable
 * @param {any} fallback - Optional fallback value if env var is missing
 * @returns {string}
 */
function getEnv(name, fallback = undefined) {
  if (!process.env[name] && fallback === undefined) {
    console.error(` Missing environment variable: ${name}`);
    process.exit(1); // Stop the app if no fallback is provided
  }
  return process.env[name] || fallback;
}

module.exports = {
  PORT: getEnv('PORT', 4000),
  DB_HOST: getEnv('DB_HOST'),
  DB_NAME: getEnv('DB_NAME'),
};
