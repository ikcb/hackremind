const got = require('got');

const { hosts } = require('../tuners');

module.exports = async () => {
  const host = 'devfolio.co';
  if (!hosts[host]) return [];

  // call the Devfolio API
  const { result: data } = await got('https://devfolio.co/api/hackathons', {
    searchParams: {
      filter: 'application_open',
      page: 1,
      limit: 20
    }
  }).json();

  // transform result to events
  return data
    .filter(
      ({ hackathon_setting: hs }) => new Date(hs.reg_ends_at) < beforeDate
    )
    .map(e => ({
      title: e.name,
      description: e.desc,
      host,
      url:
        e.hackathon_setting.site ||
        `https://${e.hackathon_setting.subdomain}.devfolio.co`,
      start: e.hackathon_setting.reg_starts_at,
      end: e.hackathon_setting.reg_ends_at,
      image: e.cover_img,
      thumbnail: e.hackathon_setting.logo
    }));
};
