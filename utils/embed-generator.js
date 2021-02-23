const captureWebsite = require('capture-website');
const got = require('got');
const pLimit = require('p-limit');
const psl = require('psl');
const Vibrant = require('node-vibrant');

const allowedHosts = {
  'adventofcode.com': 'Advent of Code',
  'atcoder.jp': 'AtCoder',
  'azspcs.net': 'AZsPCs',
  'bubblecup.org': 'Bubble Cup',
  'codechef.com': 'CodeChef',
  'codeforces.com': 'Codeforces',
  'codeforces.com/gyms': 'Gym - Codeforces',
  'codility.com': 'Codility',
  'codingame.com': 'CodinGame',
  'codingcompetitions.withgoogle.com': 'Google',
  'ctftime.org': 'CTFtime',
  'devfolio.co': 'Devfolio',
  'devpost.com': 'Devpost',
  'dmoj.ca': 'DMOJ: Modern Online Judge',
  'e-olymp.com': 'E-Olymp',
  'facebook.com/hackercup': 'Facebook',
  'hackerearth.com': 'HackerEarth',
  'hackerrank.com': 'HackerRank',
  'icfpcontest.org': 'ICFP Programming Contest',
  'kaggle.com': 'Kaggle',
  'leetcode.com': 'LeetCode',
  'open.kattis.com': 'Kattis',
  'projecteuler.net': 'Project Euler',
  'russianaicup.ru': 'Russian AI Cup',
  'spoj.com': 'Sphere Online Judge (SPOJ)',
  'tlx.toki.id': 'TLX',
  'topcoder.com': 'Topcoder'
};

const colors = {};

const generateColor = async url => {
  if (!Object.prototype.hasOwnProperty.call(colors, url))
    try {
      const image = await captureWebsite.buffer(url);
      const pallette = await Vibrant.from(image).getPalette();
      colors[String(url)] = parseInt(pallette.Vibrant.hex.slice(1), 16);
    } catch {
      // console.warn(url);
      return 0;
    }
  return colors[String(url)];
};

const hosts = {};

const generateURL = async (host, url) => {
  if (!url.includes(host)) return new URL(url).origin;
  if (!Object.prototype.hasOwnProperty.call(hosts, host))
    try {
      const { url: hostURL } = await got(`https://${host}`);
      hosts[String(host)] = hostURL;
    } catch {
      hosts[String(host)] = `http://${host}`;
    }
  return hosts[String(host)];
};

const generateEmbed = async ({ title, host, url, start }, resources) => ({
  title,
  url,
  color: await generateColor(url),
  author: {
    name: allowedHosts[String(host)],
    url: await generateURL(host, url),
    icon_url: resources.find(o => o.name === host).icon
  },
  timestamp: start
});

const limit = pLimit(4);
const limitedEmbedGen = (...args) => limit(generateEmbed, ...args);

const getColors = () => {
  const result = {};
  Object.entries(colors).forEach(([key, value]) => {
    const { domain: host } = psl.parse(new URL(key).hostname);
    !Object.prototype.hasOwnProperty.call(result, host)
      ? (result[String(host)] = [value])
      : result[String(host)].push(value);
  });
  const avg = arr =>
    Math.round(arr.reduce((a, b) => a + b, 0) / arr.length || 0);
  Object.keys(result).forEach(key => {
    result[String(key)] = avg(result[String(key)]);
  });
  return result;
};

module.exports = {
  allowedHosts,
  limitedEmbedGen,
  getColors
};