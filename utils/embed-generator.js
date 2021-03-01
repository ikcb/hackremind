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
  'quora.com': 'Quora',
  'russianaicup.ru': 'Russian AI Cup',
  'spoj.com': 'Sphere Online Judge (SPOJ)',
  'tlx.toki.id': 'TLX',
  'topcoder.com': 'Topcoder'
};

const regWords = [
  'apply',
  'application',
  'enroll',
  'enrollment',
  'register',
  'registration'
];

const colors = {};

const filter = (r, g, b, a) =>
  ![
    [114, 137, 218],
    [255, 255, 255],
    [153, 170, 181],
    [44, 47, 51],
    [35, 39, 42],
    [0, 0, 0]
  ].some(c => [r, g, b].every((v, i) => v === c[i]));

const generateColor = async url => {
  if (!colors[url])
    try {
      const image = await captureWebsite.buffer(url);
      const pallette = await Vibrant.from(image).addFilter(filter).getPalette();
      colors[url] = parseInt(pallette.Vibrant.hex.slice(1), 16);
    } catch {
      // console.warn(url);
      return 0;
    }
  return colors[url];
};

const hosts = {};

const generateHost = async (host, url) => {
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

const checkRegistration = (title, host) =>
  ['devfolio.co'].includes(host) || regWords.some(s => title.includes(s));

const truncate = (s, n) =>
  s && (s.length > n ? `${s.substring(0, n - 1)}\u2026` : s);

const generateEmbed = async e => ({
  title: truncate(e.title, 256),
  description: truncate(e.description, 2048),
  url: e.url,
  color: await generateColor(e.url),
  author: {
    name: truncate(allowedHosts[e.host], 256),
    url: await generateHost(e.host, e.url),
    icon_url: `${process.env.ICONS_URL}${
      process.env.ICONS_URL.endsWith('/') ? '' : '/'
    }${e.host.replace(/\.|\//g, '_')}.png`
  },
  timestamp: checkRegistration(e.title.toLowerCase(), e.host) ? e.end : e.start,
  image: {
    url:
      e.image ||
      'https://github.com/iiitkota-codebase/hackremind/raw/main/assets/520x1-00000000.png'
  },
  thumbnail: {
    url: e.thumbnail
  }
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
