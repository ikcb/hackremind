const got = require('got');

const { beforeDate } = require('../tuners');

module.exports = async () => {
  // call the Devfolio API
  const devfolio = await got('https://devfolio.co/api/hackathons', {
    searchParams: {
      filter: 'application_open',
      page: 1,
      limit: 20
    }
  }).json();

  // transform result to events
  return devfolio.result
    .filter(
      ({ hackathon_setting: hs }) => new Date(hs.reg_ends_at) < beforeDate()
    )
    .map(e => ({
      title: e.name,
      description: e.desc,
      host: 'devfolio.co',
      url:
        e.hackathon_setting.site ||
        `https://${e.hackathon_setting.subdomain}.devfolio.co`,
      start: e.hackathon_setting.reg_starts_at,
      end: e.hackathon_setting.reg_ends_at,
      image: e.cover_img,
      thumbnail: e.hackathon_setting.logo
    }));
};
