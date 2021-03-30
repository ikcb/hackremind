const got = require('got');

module.exports = async host => {
  // check if the host supports https
  try {
    return (await got(`https://${host}`)).url;
  } catch {
    return `http://${host}`;
  }
};
