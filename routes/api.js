const express = require('express');

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({ foo: 'bar' });
});

module.exports = router;
