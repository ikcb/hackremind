const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const logger = require('morgan');
const { StatusCodes } = require('http-status-codes');

const BaseRouter = require('./routes/api');

const DEBUG = process.env.NODE_ENV !== 'production';

/**
 * Set basic express settings
 */

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Enable CORS
app.use(cors());

// Show routes called in console during development
DEBUG && app.use(logger('dev'));

// Security
DEBUG || app.use(helmet());

// Add APIs
app.use('/api', BaseRouter);

// Print API errors
app.use((err, req, res, next) => {
  console.error(err);
  return res
    .status(
      err.message === 'Internal Server Error' || err.response
        ? StatusCodes.INTERNAL_SERVER_ERROR
        : StatusCodes.BAD_REQUEST
    )
    .json({
      error: err.message
    });
});

// Export express instance
module.exports = app;
