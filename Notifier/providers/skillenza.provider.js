const got = require('got');

const {
  config: { SKILLENZA_JWT: Authorization },
  hosts
} = require('../tuners');
const { fixImageWidth } = require('../generators');

const fetchData = async (url, page = 1) => {
  if (page > 10) return [];

  // call the Skillenza API
  const { data } = await got(url, {
    headers: { Authorization },
    searchParams: { page }
  }).json();

  return [...data, ...(await fetchData(url, page + 1))];
};

module.exports = async () => {
  const host = 'skillenza.com';
  if (!hosts[host]) return [];

  // check if the JWT environment variable is set or not
  if (!Authorization) {
    console.error(
      'Please set SKILLENZA_JWT to use these resources:',
      'skillenza.com'
    );
    return [];
  }

  const data = await fetchData('https://skillenza.com/api/v1/activity/all');

  return Promise.all(
    data
      .filter(({ application_end_time: end }) => new Date(end) < beforeDate())
      .map(async e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        host,
        url: `https://skillenza.com/challenge/${e.slug}`,
        start: e.application_start_time,
        end: e.application_end_time,
        image: await fixImageWidth(e.card, e.banner).url,
        thumbnail: e.gang_data.logo
      }))
  );
};
