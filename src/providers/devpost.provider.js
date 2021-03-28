const cheerio = require('cheerio');
const entities = require('entities');
const got = require('got');

const { beforeDate } = require('../tuners');

const fetchData = async (url, searchParams, page = 1) => {
  // call the Devpost API
  const data = await got(url, {
    searchParams: Object.assign(searchParams, { page })
  }).json();

  // implement pagination
  const { total_count: totalCount, per_page: perPage } = data.meta;
  if (perPage * page >= totalCount) return data.hackathons;

  // append hackathons recursively
  return [
    ...data.hackathons,
    ...(await fetchData(url, searchParams, page + 1))
  ];
};

const parseDate = str => {
  const matches = /^(\w{3})\s(\d{2}).*?(\d{4})/.exec(str);
  return new Date([...matches].splice(1).join(' '));
};

const getDetails = async url => {
  const html = await got(url);
  const $ = cheerio.load(html.body);

  // scrape required JSON data
  return JSON.parse($('#challenge-json-ld').html());
};

module.exports = async () => {
  // fetch hackathon data
  let data = await fetchData('https://devpost.com/api/hackathons', {
    challenge_type: 'online',
    order_by: 'recently-added',
    status: 'upcoming'
  });

  // remove hackathons whose last date of submission is after more than 7 days
  data = data.filter(e => parseDate(e.submission_period_dates) < beforeDate);

  // transform data to events
  await Promise.all(
    data.map(async (e, i) => {
      const details = await getDetails(e.url);

      data[i] = {
        title: e.title,
        description: entities.decodeHTML(details.description),
        host: 'devpost.com',
        url: e.url,
        start: details.startDate,
        end: details.endDate,
        image: details.image,
        thumbnail: `https://${e.thumbnail_url.replace(/(^\w+:|^)\/\//, '')}`
      };
    })
  );

  return data;
};
