const serverless = require('serverless-http');
const app = require('../server'); // assuming your existing file is named server.js
module.exports = serverless(app);