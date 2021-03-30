const got = require('got');

module.exports = async host => {
  // check if the host supports https
  return (await got(`https://${host}`)).url || `http://${host}`;
};
