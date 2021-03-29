const got = require('got');

// cache
const hosts = {};

module.exports = async (host, url) => {
  // if host is not in URL, it is most probably of an annual event whose url is
  // changed every year
  if (!url.includes(host)) return new URL(url).origin;

  // if not in cache
  if (!hosts[host])
    // check if the host supports https, and
    // store final url (after redirection, if any) in cache
    try {
      const { url: hostURL } = await got(`https://${host}`);
      hosts[host] = hostURL;
    } catch {
      hosts[host] = `http://${host}`;
    }

  // return cached value
  return hosts[host];
};
