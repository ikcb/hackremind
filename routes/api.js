const fetch = require('node-fetch');
const router = require('express').Router();

router.get('/', (req, res, next) => {
  res.json({ foo: 'bar' });
});

router.get('/test', async (req, res, next) => {
  const response = await fetch(
    `https://devpost.com/hackathons?challenge_type=all&page=${1}&search=&sort_by=Prize+Amount&utf8=%E2%9C%93`
  );

  const body = await response.text();

  console.log(body);
  res.json({ foo: 'bar', body });
});

module.exports = router;
