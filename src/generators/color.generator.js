const captureWebsite = require('capture-website');
const pLimit = require('p-limit');
const psl = require('psl');
const Vibrant = require('node-vibrant');

// cache
const colors = {};

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
const limit = pLimit(Number(process.env.CONCURRENCY) || 1);

const generateColor = async url => {
  // if color not in cache
  if (!colors[url])
    try {
      // get screenshot of website
      const image = await limit(() =>
        captureWebsite.buffer(
          url,
          // https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#setting-up-chrome-linux-sandbox
          process.platform === 'win32'
            ? null
            : {
                launchOptions: {
                  args: ['--no-sandbox', '--disable-setuid-sandbox']
                }
              }
        )
      );

      // generate palette from the screenshot
      const palette = await Vibrant.from(image).addFilter(filter).getPalette();

      // convert color from hex to dec and store it in cache
      colors[url] = parseInt(palette.Vibrant.hex.slice(1), 16);
    } catch {
      return 0; // failure to find any vibrant color
    }

  // return cached value
  return colors[url];
};

const retrieveCachedColors = () => {
  const result = {};

  // cache by hostname
  Object.entries(colors).forEach(([key, value]) => {
    const { domain: host } = psl.parse(new URL(key).hostname);
    !result[host] ? (result[host] = [value]) : result[host].push(value);
  });

  // function to calculate average of an array
  const avg = arr =>
    arr.length < 1
      ? 0
      : Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

  // replace each array of cache by its average
  Object.keys(result).forEach(key => {
    result[key] = avg(result[key]);
  });

  return result;
};

module.exports = { generateColor, retrieveCachedColors };
