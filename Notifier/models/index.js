const { Schema, model } = require('mongoose');

// TODO: add validation
const eventSchema = new Schema(
  {
    id: String,
    title: String,
    description: String,
    host: String,
    url: String,
    start: Date,
    end: Date,
    image: String,
    thumbnail: String
  },
  { id: false }
);

module.exports = { Event: model('Event', eventSchema) };
