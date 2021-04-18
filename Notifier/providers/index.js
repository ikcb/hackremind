global.afterDate = () =>
  new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );
global.beforeDate = () => new Date(+afterDate() + 4 * 8.64e7);

const clist = require('./clist.provider');
const dare2compete = require('./dare2compete.provider');
const devfolio = require('./devfolio.provider');
const devpost = require('./devpost.provider');
const skillenza = require('./skillenza.provider');

const { generateTimestamp } = require('../generators');

module.exports = async () => {
  const data = [
    ...(await clist()),
    ...(await devfolio()),
    ...(await devpost()),
    ...(await dare2compete()),
    ...(await skillenza())
  ];

  // remove hiring events and sort data by timestamp
  return data
    .filter(e => !/hiring/i.test(e.title))
    .sort(
      (a, b) =>
        new Date(generateTimestamp(a).timestamp).getTime() -
        new Date(generateTimestamp(b).timestamp).getTime()
    );
};
