const { Schema, model } = require('mongoose');

const eventSchema = new Schema({
  title: String,
  host: String,
  url: String,
  start: Date,
  end: Date
});

const Event = model('Event', eventSchema);

module.exports = Event;
