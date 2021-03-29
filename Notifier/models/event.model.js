const { Schema, model } = require('mongoose');

// TODO: add validation
const eventSchema = new Schema({
  title: String,
  description: String,
  host: String,
  url: String,
  start: Date,
  end: Date,
  image: String,
  thumbnail: String
});

module.exports = model('Event', eventSchema);
