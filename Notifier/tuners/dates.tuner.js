const now = new Date();

const afterDate = () =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate());

const beforeDate = () =>
  new Date(afterDate().setDate(afterDate().getDate() + 4));

const preserveTill = () =>
  new Date(afterDate().setDate(afterDate().getDate() - 5));

module.exports = { afterDate, beforeDate, preserveTill };
