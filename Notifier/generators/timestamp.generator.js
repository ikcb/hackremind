const regWords = [
  'apply',
  'application',
  'enroll',
  'enrollment',
  'register',
  'registration'
];

// TODO: implement some better algorithm
const checkRegistration = (title, host) =>
  ['devfolio.co', 'dare2compete.com'].includes(host.toLowerCase()) ||
  regWords.some(s => title.toLowerCase().includes(s));

module.exports = e => ({
  timestamp: checkRegistration(e.title, e.host) ? e.end : e.start
});
