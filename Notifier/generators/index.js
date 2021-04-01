const fixImageWidth = require('./image.generator');
const generateHost = require('./host.generator');
const generateTimestamp = require('./timestamp.generator');
const truncateText = require('./text.generator');
const {
  closeBrowser,
  generateColor,
  openBrowser
} = require('./color.generator');

const { hosts, config } = require('../tuners');

const generateEmbed = async e => {
  const title = truncateText(e.title, 256);
  const description = truncateText(e.description, 2048);
  const { host, url } = e;
  const color = await generateColor(url, e.image);
  const author = {
    name: truncateText(hosts[host], 256),
    url: await generateHost(host),
    icon_url: `${config.ICONS_URL}${host.replace(/[./]/g, '_')}.png`
  };
  const { timestamp } = generateTimestamp(e);
  const image = await fixImageWidth(e.image);
  const thumbnail =
    description &&
    description.length > 1 &&
    e.thumbnail &&
    !e.thumbnail.toLowerCase().includes('placeholder')
      ? { url: e.thumbnail }
      : undefined;

  // create embed
  return {
    title,
    description,
    url,
    color,
    author,
    timestamp,
    image,
    thumbnail
  };
};

module.exports = {
  closeBrowser,
  fixImageWidth,
  generateEmbed,
  generateTimestamp,
  openBrowser
};
