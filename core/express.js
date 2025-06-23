// *************** IMPORT LIBRARY ***************
const express = require('express');

/**
 * Initializes and returns an Express application instance.
 *
 * This function sets up a new Express app that can be used to
 * attach middleware, routes, or integrate with Apollo Server.
 *
 * @function ExpressApp
 * @returns {import('express').Express} An instance of an Express application.
 */
function CreateExpressApp() {
  const app = express();
  return app;
}

// *************** EXPORT CORE ***************
module.exports = CreateExpressApp;
