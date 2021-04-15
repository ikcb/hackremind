const got = require('got');
const probe = require('probe-image-size');

const truncateText = require('./text.generator');
const {
  openBrowser,
  generateColor,
  closeBrowser
} = require('./color.generator');

const { hosts } = require('../tuners');

// fixes image url to make sure that each embed has the same width
const fixImageWidth = async (
  img,
  defaultURL = 'https://github.com/iiitkota-codebase/hackremind/raw/main/assets/520x1-00000000.png'
) => {
  let url = defaultURL;

  // use img if it's not a placeholder, its A.R. >= 4:3 and width >= 432px
  if (img && img.length > 0 && !img.toLowerCase().includes('placeholder')) {
    const { width, height } = await probe(img);
    url = width / height < 4 / 3 || width < 432 ? url : img;
  }

  return { url };
};

const generateHost = async host => {
  try {
    return (await got(`https://${host}`)).url;
  } catch {
    return `http://${host}`;
  }
};

// TODO: implement some better algorithm
const checkRegistration = (title, host) =>
  ['devfolio.co', 'dare2compete.com', 'skillenza.com'].includes(host) ||
  /regist(?:er|ration)|appl(?:y|ication)|enroll/i.test(title);

const generateTimestamp = e => ({
  timestamp: checkRegistration(e.title.toLowerCase(), e.host) ? e.end : e.start
});

const generateEmbed = async e => {
  const title = truncateText(e.title, 256);
  const description = truncateText(e.description, 2048);
  const { host, url } = e;
  const author = {
    name: truncateText(hosts[host], 256),
    url: await generateHost(host),
    icon_url: `https://raw.githubusercontent.com/iiitkota-codebase/hackremind/main/assets/icons/${host.replace(
      /[./]/g,
      '_'
    )}.png`
  };
  const color = await generateColor([
    url,
    e.image,
    e.thumbnail,
    author.icon_url
  ]);
  const { timestamp } = generateTimestamp(e);
  const image = await fixImageWidth(e.image);
  const thumbnail =
    description &&
    description.length > 1 &&
    e.thumbnail &&
    !e.thumbnail.toLowerCase().includes('placeholder')
      ? { url: e.thumbnail }
      : null;

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
