const got = require('got');

const { afterDate, beforeDate } = require('../tuners');
const { CLIST_BEARER: Authorization } = require('../config');

module.exports = async () => {
  // call the CLIST API
  const data = await got('https://clist.by/api/v2/contest/', {
    headers: { Authorization },
    searchParams: {
      start__gt: afterDate().toISOString(),
      start__lt: beforeDate().toISOString()
    }
  }).json();

  // transform objects to events
  return data.objects
    .filter(({ event }) => /^[ -~]+$/.test(event))
    .map(e => ({
      title: e.event,
      host: e.resource,
      url: e.href,
      start: e.start,
      end: e.end
    }));
};
