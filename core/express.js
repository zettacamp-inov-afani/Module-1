// *************** IMPORT CORE ***************
const express = require('express');

function ExpressApp() {
  const app = express();
  return app;
}

// *************** EXPORT CORE ***************
module.exports = ExpressApp;
