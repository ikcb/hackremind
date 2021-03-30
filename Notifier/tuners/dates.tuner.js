const now = new Date();

const afterDate = () =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
const beforeDate = () =>
  new Date(new Date(afterDate()).setUTCDate(afterDate().getUTCDate() + 4));

module.exports = { afterDate, beforeDate };
