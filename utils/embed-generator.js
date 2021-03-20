const captureWebsite = require('capture-website');
const cheerio = require('cheerio');
const got = require('got');
const pLimit = require('p-limit');
const probe = require('probe-image-size');
const psl = require('psl');
const truncate = require('markdown-truncate');
const TurndownService = require('turndown');
const Vibrant = require('node-vibrant');
const { gfm } = require('turndown-plugin-gfm');

const allowedHosts = {
  'adventofcode.com': 'Advent of Code',
  'atcoder.jp': 'AtCoder',
  'azspcs.net': 'AZsPCs',
  'bubblecup.org': 'Bubble Cup',
  'challenges.reply.com': 'Reply Challenges',
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

const hardTruncate = (s, n) =>
  s && (s.length > n ? `${s.substring(0, n - 1)}\u2026` : s);

const fixImageWidth = async img => {
  let url =
    'https://github.com/iiitkota-codebase/hackremind/raw/main/assets/520x1-00000000.png';
  if (img && img.length > 0 && !img.toLowerCase().includes('placeholder')) {
    const dim = await probe(img);
    url = dim.width / dim.height < 4 / 3 || dim.width < 432 ? url : img;
  }
  return { url };
};

const rules = {};

rules.strikethrough = {
  filter: ['del', 's', 'strike'],
  replacement: content => `~~${content}~~`
};

rules.underline = {
  filter: ['u'],
  replacement: content => `__${content}__`
};

rules.image = {
  filter: ['img'],
  replacement: _ => ''
};

rules.strong = {
  filter: ['strong', 'b'],
  replacement: content => {
    const txt = content.trim();
    if (!txt) return '';
    if (!/[a-zA-Z]/.test(txt)) return txt;
    return `**${txt}**`;
  }
};

const turndownService = new TurndownService({ codeBlockStyle: 'fenced' });
turndownService.use(gfm);

Object.entries(rules).forEach(([key, value]) =>
  turndownService.addRule(key, value)
);

const fixTables = content => {
  const $ = cheerio.load(content);

  $('table').each((index, el) => {
    const myTable = $(el);
    myTable.find('p').each((i, p) => $(p).replaceWith($(p).html()));

    let thead = myTable.find('thead');
    let tbody = myTable.find('tbody');

    const thRows = myTable.find('tr:has(th)');
    const tdRows = myTable.find('tr:has(td)');

    if (thead.length === 0) thead = $('<thead></thead>').prependTo(myTable);
    if (tbody.length === 0) tbody = $('<tbody></tbody>').appendTo(myTable);

    thRows.clone(true).appendTo(thead);
    thRows.remove();

    tdRows.clone(true).appendTo(tbody);
    tdRows.remove();

    if (thead.find('tr').length === 0 && tbody.find('tr').length) {
      const firstRow = tbody.find('tr').first();
      firstRow.appendTo(thead);
    }
  });

  return $('body').html();
};

// TODO: Analyse regex for ReDOS vulnerabilities
const replacements = [
  [/[\u200B-\u200D\uFEFF]/gu, ''],
  [/^\*[^\S\r\n]+/gm, '\u2800\u2022\u2800'],
  [/^([^\S\r\n]*?)[^\S\r\n]\*[^\S\r\n]+/gm, '$1\u2800\u2800\u25e6\u2800'],
  [/(?<=^[^\S\r\n]*)[^\S\r\n]{2}(?=[^\S\r\n]*\u2800+\u25e6)/gmu, '\u2800'],
  [/(?<!~)~([^~\n]+)~(?!~)/g, '~~$1~~'],
  [/^[^\S\r\n]*?#+[^\S\r\n]*([^]+?)$/gm, '\n> __**$1**__\n'],
  [/(?<=\u201c([^\u201d"]+))"/gu, '\u201d'],
  [/"(?=([^\u201c"]+)\u201d)/gu, '\u201c'],
  [/\n\s+\n/g, '\n\n'],
  [/(?:\*\*){2,}/g, '**'],
  [/\.{3,}/g, '\u2026'],
  [/^[^\S\r\n]*\*\*\S(?:(?!\*\*).){1,50}\S\*\*[^\S\r\n]*$/gm, '> __$&__'],
  [/> __(?![^]*> __)[^]+\u2026$/gu, '']
];

const smartTruncate = (txt, limit, isHTML) => {
  const md = isHTML ? turndownService.turndown(fixTables(txt)) : txt;
  let s = truncate(md, { limit, ellipsis: true });
  replacements.forEach(i => {
    const replacement = s.replace(...i);
    if (replacement && replacement.length > 1) s = replacement;
  });
  return s.trim();
};

const generateEmbed = async e => ({
  title: hardTruncate(smartTruncate(e.title, 150), 256),
  description: hardTruncate(
    smartTruncate(e.description, 1500, e.host === 'devpost.com'),
    2048
  ),
  url: e.url,
  color: await generateColor(e.url),
  author: {
    name: hardTruncate(smartTruncate(allowedHosts[e.host], 150), 256),
    url: await generateHost(e.host, e.url),
    icon_url: `${process.env.ICONS_URL}${
      process.env.ICONS_URL.endsWith('/') ? '' : '/'
    }${e.host.replace(/\.|\//g, '_')}.png`
  },
  timestamp: checkRegistration(e.title.toLowerCase(), e.host) ? e.end : e.start,
  image: await fixImageWidth(e.image),
  thumbnail: {
    url:
      !(e.description && e.description.length > 1) ||
      (e.thumbnail && e.thumbnail.toLowerCase().includes('placeholder'))
        ? undefined
        : e.thumbnail
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
