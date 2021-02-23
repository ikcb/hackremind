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
  if (!colors[url])
    try {
      const image = await captureWebsite.buffer(url);
      const pallette = await Vibrant.from(image).getPalette();
      colors[url] = parseInt(pallette.Vibrant.hex.slice(1), 16);
    } catch {
      // console.warn(url);
      return 0;
    }
  return colors[url];
};

const hosts = {};

const generateURL = async (host, url) => {
  if (!url.includes(host)) return new URL(url).origin;
  if (!hosts[host])
    try {
      const { url: hostURL } = await got(`https://${host}`);
      hosts[host] = hostURL;
    } catch {
      hosts[host] = `http://${host}`;
    }
  return hosts[host];
};

const generateEmbed = async ({ title, host, url, start }, resources) => ({
  title,
  url,
  color: await generateColor(url),
  author: {
    name: allowedHosts[host],
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
    !result[host] ? (result[host] = [value]) : result[host].push(value);
  });
  const avg = arr =>
    Math.round(arr.reduce((a, b) => a + b, 0) / arr.length || 0);
  Object.keys(result).forEach(key => {
    result[key] = avg(result[key]);
  });
  return result;
};

module.exports = {
  allowedHosts,
  limitedEmbedGen,
  getColors
};
