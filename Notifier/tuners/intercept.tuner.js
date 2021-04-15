const { PRODUCTION } = require('./config.tuner');

const original = pick(console, ['log', 'error', 'warn', 'info', 'debug']);

const intercept = context => {
  if (!PRODUCTION) return;

  console.log = context.log;
  console.error = context.log.error;
  console.warn = context.log.warn;
  console.info = context.log.info;
  console.debug = context.log.verbose;
};

const reset = () => {
  Object.entries(original).forEach(([key, value]) => {
    console[key] = value;
  });
};

module.exports = { intercept, reset };
