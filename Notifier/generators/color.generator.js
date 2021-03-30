const captureWebsite = require('capture-website');
const pLimit = require('p-limit');
const randomColor = require('randomcolor');
const Vibrant = require('node-vibrant');

const { config } = require('../tuners');

// remove branding colors (https://discord.com/branding)
// returns true if the color can be kept else false
const filter = (r, g, b, a) =>
  ![
    [114, 137, 218],
    [255, 255, 255],
    [153, 170, 181],
    [44, 47, 51],
    [35, 39, 42],
    [0, 0, 0]
  ].some(c => [r, g, b].every((v, i) => v === c[i]));

// limit number of simultaneous puppeteer instances
const limit = pLimit(config.CONCURRENCY);

module.exports = async url => {
  let color = randomColor({ luminosity: 'light' });

  try {
    // get screenshot of website
    const image = await limit(() => captureWebsite.buffer(url));

    // generate palette from the screenshot
    const palette = await Vibrant.from(image).addFilter(filter).getPalette();
    color = palette.Vibrant.hex;
  } catch {}

  // convert color from hex to dec
  return parseInt(color.slice(1), 16);
};
