/**
 * Vercel Serverless Function Entry Point
 * Routes all /api/* HTTP requests to the Express server instance.
 */

const app = require('../server/server');

module.exports = app;
