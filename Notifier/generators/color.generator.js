const fkill = require('fkill');
const got = require('got');
const pLimit = require('p-limit');
const puppeteer = require('puppeteer');
const randomColor = require('randomcolor');
const Vibrant = require('node-vibrant');

const {
  config: { PRODUCTION }
} = require('../tuners');

// will hold puppeteer browser instance
let browser;
const openBrowser = async () => {
  browser = await puppeteer.launch();
};

// generates image/screenshot buffer of the provided URL
const captureWebsite = async url => {
  if (!url || url.length < 1) return null;

  // fetch URL
  const responsePromise = got(url);
  const bufferPromise = responsePromise.buffer();

  const [response, buffer] = await Promise.all([
    responsePromise,
    bufferPromise
  ]);

  // check if URL is already an image
  try {
    if (response.headers['content-type'].includes('image')) return buffer;
  } catch {}

  // else take screenshot of the site
  const page = await browser.newPage();
  await page.goto(url, { timeout: 60000 });

  const screenshotBuffer = await page.screenshot({
    clip: {
      x: 0,
      y: 0,
      width: 1280,
      height: 800
    },
    waitUntil: 'networkidle2'
  });

  // close opened page
  await page.close();
  return screenshotBuffer;
};

// closes browser (use when work is finished)
const closeBrowser = async () => {
  try {
    await browser.close();
  } catch {}

  // kill zombie chrome processes
  PRODUCTION &&
    (await fkill('chrome', {
      force: true,
      ignoreCase: true,
      silent: true
    }));
};

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
const limit = pLimit(4);

const getPalette = buffer =>
  Vibrant.from(buffer).addFilter(filter).getPalette();

// https://www.w3.org/TR/AERT/#color-contrast
const isLight = rgb => {
  /* eslint-disable no-bitwise */
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  /* eslint-enable no-bitwise */

  return (r * 299 + g * 587 + b * 114) / 1000 >= 128;
};

// converts hex to rgb
const RGB = hex => parseInt(hex.slice(1), 16);

// fixes luminosity of color
const fixColor = hex => {
  const rgb = RGB(hex);
  if (isLight(rgb)) return rgb; // no need to fix

  // try generating bright color with same hue
  const fixB = RGB(randomColor({ luminosity: 'bright', hue: hex }));
  if (isLight(fixB)) return fixB;

  // generate and return light color with same hue
  return RGB(randomColor({ luminosity: 'light', hue: hex }));
};

const generateColor = async urls => {
  let color = randomColor({ luminosity: 'bright' });

  // eslint-disable-next-line no-restricted-syntax
  for (const url of urls) {
    try {
      const buffer = await limit(() => captureWebsite(url));

      // generate palette from the image buffer
      color = (await getPalette(buffer)).Vibrant.hex;

      break; // will break the loop if above steps are successful
    } catch {}
  }

  // convert color from hex to dec
  return fixColor(color);
};

module.exports = { openBrowser, generateColor, closeBrowser };
