const express = require('express');

const Event = require('../models/event.model');

const router = express.Router();

router.get('/', (req, res, next) => {
  res.json({ foo: 'bar' });
});

router.post('/test', (req, res, next) => {
  Event.findOneAndUpdate(
    { url: req.body.url },
    { $setOnInsert: req.body },
    { upsert: true, new: true },
    (error, result) =>
      error || !result
        ? next(err || new Error('Internal Server Error'))
        : res.json(result)
  );
});

module.exports = router;
