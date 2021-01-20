const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const { StatusCodes } = require('http-status-codes');
require('dotenv').config();

const BaseRouter = require('./routes/api');

const app = express();

/** **********************************************************************************
 *                              Set basic express settings
 ********************************************************************************** */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
  app.use(logger('dev'));
}

// Security
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
}

// Add APIs
app.use('/api', BaseRouter);

// Print API errors
app.use((err, _req, res) => {
  console.error(err);
  return res.status(StatusCodes.BAD_REQUEST).json({
    error: err.message
  });
});

// Export express instance
module.exports = app;
