const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const logger = require('morgan');
const { connect, connection } = require('mongoose');
const { StatusCodes } = require('http-status-codes');
require('dotenv').config();

const BaseRouter = require('./routes/api');

const DEBUG = process.env.NODE_ENV !== 'production';

/**
 * Connect to MongoDB instance
 */

connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true
});

connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', () => DEBUG && console.log('mongodb connected'));

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
  return res.status(StatusCodes.BAD_REQUEST).json({
    error: err.message
  });
});

// Export express instance
module.exports = app;
