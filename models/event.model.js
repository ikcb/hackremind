const { Schema, model } = require('mongoose');

const eventSchema = new Schema({
  title: String,
  host: String,
  url: { type: String, unique: true },
  start: Date,
  end: Date
});

const Event = model('Event', eventSchema);

module.exports = Event;
