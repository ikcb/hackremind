const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
  res.json({ foo: 'bar' });
});

module.exports = router;
