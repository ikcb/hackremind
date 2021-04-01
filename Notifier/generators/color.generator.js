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

// generates screenshot of the provided URL
const captureWebsite = async url => {
  const page = await browser.newPage();
  await page.goto(url, { timeout: 60000 });
  const screenshotBuffer = await page.screenshot({
    clip: {
      x: 0,
      y: 0,
      width: 1280,
      height: 800
    }
  });
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

const generateColor = async url => {
  let color = randomColor({ luminosity: 'bright' });

  try {
    // get screenshot of website
    const image = await limit(() => captureWebsite(url));

    // generate palette from the screenshot
    const palette = await Vibrant.from(image).addFilter(filter).getPalette();
    color = palette.Vibrant.hex;
  } catch {}

  // convert color from hex to dec
  return parseInt(color.slice(1), 16);
};

module.exports = { closeBrowser, generateColor, openBrowser };
