global.pick = (obj, ...keys) =>
  Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key)));

const config = require('./config.tuner');
const hosts = require('./hosts.tuner');
const { intercept, reset } = require('./intercept.tuner');

module.exports = {
  config,
  hosts,
  intercept,
  reset
};
