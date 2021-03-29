const clist = require('./clist.provider');
const dare2compete = require('./dare2compete.provider');
const devfolio = require('./devfolio.provider');
const devpost = require('./devpost.provider');

const { generateTimestamp } = require('../generators');

module.exports = async () => {
  let data = [
    ...(await clist()),
    ...(await devfolio()),
    ...(await devpost()),
    ...(await dare2compete())
  ];

  // remove hiring events
  data = data.filter(e => !/hiring/i.test(e.title));

  // sort data by timestamp
  return data.sort(
    (a, b) =>
      new Date(generateTimestamp(a).timestamp).getTime() -
      new Date(generateTimestamp(b).timestamp).getTime()
  );
};
