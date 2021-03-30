const got = require('got');

const { beforeDate } = require('../tuners');
const { fixImageWidth } = require('../generators');

module.exports = async () => {
  // call the Dare2Compete API
  let { data } = await got(
    'https://api.dare2compete.com/api/opportunity/search-new',
    {
      searchParams: {
        opportunity: 'hackathons',
        filters: ',All,Open',
        types: 'teamsize,eligible,oppstatus'
      }
    }
  ).json();

  // remove hackathons which are starting after more than 2 days
  data = data.data.filter(e => new Date(e.start_date) < beforeDate());

  // transform IDs to events
  await Promise.all(
    data.map(async ({ id }, i) => {
      // fetch competition details from id
      let { data: competition } = await got(
        `https://dare2compete.com/api/competition/${id}`
      ).json();
      competition = competition.competition;

      // choose which image to store
      const { url: image } = await fixImageWidth(
        competition.banner.path.startsWith('uploads')
          ? competition.banner.image_url
          : competition.banner_mobile.path.startsWith('uploads')
          ? competition.banner_mobile.image_url
          : '',
        competition.meta_info.sharable_image_url
      );

      // map fetched competition data to event properties
      data[i] = {
        title: competition.title,
        description: competition.meta_info.description || competition.details,
        host: 'dare2compete.com',
        url: competition.web_url || competition.seo_url,
        start: competition.regnRequirements.start_regn_dt,
        end: competition.regnRequirements.end_regn_dt,
        image,
        thumbnail: competition.logoUrl2
      };
    })
  );

  return data;
};
