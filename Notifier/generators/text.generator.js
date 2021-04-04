const cheerio = require('cheerio');
const truncate = require('markdown-truncate');
const TurndownService = require('turndown');
const { gfm } = require('turndown-plugin-gfm');

// Turndown rules
const rules = {};

// add underline support
rules.underline = {
  filter: ['u'],
  replacement: content => `__${content}__`
};

// remove all inline images
rules.image = {
  filter: ['img'],
  replacement: _ => ''
};

// don't emphasis text containing no alphabet
rules.strong = {
  filter: ['strong', 'b'],
  replacement: content => {
    const txt = content.trim();
    if (!txt) return '';
    if (!/[a-zA-Z]/.test(txt)) return txt;
    return `**${txt}**`;
  }
};

// initialise Turndown service and configure it to use GitHub Flavored Markdown
const turndownService = new TurndownService({ codeBlockStyle: 'fenced' });
turndownService.use(gfm);

// configure service to use overridden rules
Object.entries(rules).forEach(([key, value]) =>
  turndownService.addRule(key, value)
);

// https://github.com/domchristie/turndown/issues/89#issuecomment-323625287
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

    thRows.clone().appendTo(thead);
    thRows.remove();

    tdRows.clone().appendTo(tbody);
    tdRows.remove();

    if (thead.find('tr').length === 0 && tbody.find('tr').length) {
      const firstRow = tbody.find('tr').first();
      firstRow.appendTo(thead);
    }
  });

  return $('body').html();
};

// sanitization rules (order matters, hard to explain, added after stress tests)
const replacements = [
  [/[\u200B-\u200D\uFEFF]/gu, ''],
  [/^[*\u2022][^\S\r\n]+/gmu, '\u2800\u2022\u2800'],
  [/^([^\S\r\n]*?)[^\S\r\n]\*[^\S\r\n]+/gm, '$1\u2800\u2800\u25e6\u2800'],
  [/(?<=^[^\S\r\n]*)[^\S\r\n]{2}(?=[^\S\r\n]*\u2800+\u25e6)/gmu, '\u2800'],
  [/(?<=^\u2800{3,}\s\u2800{2})\u25e6/gmu, '\u25aa'],
  [/^(\d+.)[^\S\r\n]+/gm, '\u2800$1\u2800'],
  [/^([^\S\r\n]*?)[^\S\r\n](\d+.)[^\S\r\n]+/gm, '$1\u2800\u2800$2\u2800'],
  [/(?<=^[^\S\r\n]*)[^\S\r\n]{2}(?=[^\S\r\n]*\u2800+\d+.)/gmu, '\u2800'],
  [/(?<!~)~([^~\n]+)~(?!~)/g, '~~$1~~'],
  [/^[^\S\r\n]*?#+[^\S\r\n]*([^]+?)$/gm, '\n> __**$1**__\n'],
  [/(?<=\u201c([^\u201d"]+))"/gu, '\u201d'],
  [/"(?=([^\u201c"]+)\u201d)/gu, '\u201c'],
  [/\n\s+\n/g, '\n\n'],
  [/(?:\*\*){2,}/g, '**'],
  [/\.{3,}/g, '\u2026'],
  [/^[^\S\r\n]*\*\*\S(?:(?!\*\*).){1,50}\S\*\*[^\S\r\n]*$/gm, '> __$&__'],
  [/> __(?![^]*> __)[^]+\u2026$/gu, ''],
  [/(\n+)(?=^> __\*\*)/gm, '\n\n']
];

// soft truncate - length of output may be more than limit
const softTruncate = (data, limit) => {
  if (!data || data.trim().length < 1 || limit < 1) return null;
  const txt = data.trim();

  // check if input is Markdown or HTML (Discord does not support HTML in MD)
  const isHTML = /<[^>]*>/.test(txt);

  // convert HTML to Markdown if present
  const md = isHTML ? turndownService.turndown(fixTables(txt)) : txt;

  // markdown aware truncate
  let s = truncate(md, { limit, ellipsis: true });

  // sanitize output
  replacements.forEach(i => {
    const replacement = s.replace(...i);
    if (replacement && replacement.length > 1) s = replacement;
  });

  // remove whitespaces from end
  return s.trim();
};

// hard truncate - length of output will never exceed limit
const hardTruncate = (data, limit) =>
  data && data.length > limit ? `${data.substring(0, limit - 1)}\u2026` : data;

module.exports = (data, limit) =>
  hardTruncate(softTruncate(data, Math.trunc(limit / 1.5)), limit);
