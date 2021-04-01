const got = require('got');
const pLimit = require('p-limit');
const puppeteer = require('puppeteer');
const randomColor = require('randomcolor');
const shell = require('shelljs');
const Vibrant = require('node-vibrant');

const { config } = require('../tuners');

// will hold puppeteer browser instance
let browser;
const openBrowser = async () => {
  browser = await puppeteer.launch();
};

// generates image/screenshot buffer of the provided URL
const captureWebsite = async url => {
  if (!url || url.length < 1) return null;

  // fetch url
  const responsePromise = got(url);
  const bufferPromise = responsePromise.buffer();

  const [response, buffer] = await Promise.all([
    responsePromise,
    bufferPromise
  ]);

  // check if url is already an image
  if (response.headers['content-type'].includes('image')) return buffer;

  // else take screenshot of the site
  const page = await browser.newPage();
  await page.setContent(response.body, { timeout: 60000 });

  const screenshotBuffer = await page.screenshot({
    clip: {
      x: 0,
      y: 0,
      width: 1280,
      height: 800
    }
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

  // close zombie chrome processes
  shell.exec('pkill chrome');
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
const limit = pLimit(config.CONCURRENCY);

const getPalette = buffer =>
  Vibrant.from(buffer).addFilter(filter).getPalette();

// TODO: make color vibrant/bright
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
  return parseInt(color.slice(1), 16);
};

module.exports = { closeBrowser, generateColor, openBrowser };
