const got = require('got');

const {
  config: { CLIST_BEARER: Authorization, INTERNATIONAL },
  hosts
} = require('../tuners');

module.exports = async () => {
  // get the resources to fetch data from
  const resource = Object.keys(hosts)
    .filter(
      e =>
        ![
          'dare2compete.com',
          'devfolio.co',
          'devpost.com',
          'skillenza.com'
        ].includes(e)
    )
    .join();

  // check if any resource in hosts requires the CLIST API
  if (!resource) return [];

  // check if bearer environment variable is set or not
  if (!Authorization) {
    console.error(
      'Please set CLIST_BEARER to use these resources:',
      resource.replace(/,/g, ', ')
    );
    return [];
  }

  // call CLIST API v2
  const data = await got('https://clist.by/api/v2/contest/', {
    headers: { Authorization },
    searchParams: {
      start__gt: afterDate.toISOString(),
      start__lt: beforeDate.toISOString(),
      resource,
      order_by: 'start'
    }
  }).json();

  // transform objects to events
  return data.objects
    .filter(({ event }) => INTERNATIONAL || /^[ -~]+$/.test(event))
    .map(e => ({
      title: e.event,
      host: e.resource,
      url: e.href,
      start: e.start,
      end: e.end
    }));
};
