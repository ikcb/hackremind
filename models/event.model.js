const { Schema, model } = require('mongoose');

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

const Event = model('Event', eventSchema);

module.exports = Event;
