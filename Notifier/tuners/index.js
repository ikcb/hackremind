const config = require('./config.tuner');
const hosts = require('./hosts.tuner');
const { intercept, reset } = require('./intercept.tuner');

module.exports = { config, hosts, intercept, reset };
