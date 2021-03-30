// eslint-disable-next-line global-require, import/no-extraneous-dependencies, node/no-unpublished-require
process.env.NODE_ENV === 'production' || require('dotenv').config();

if (
  !process.env.MONGO_URI ||
  !process.env.CLIST_BEARER ||
  !process.env.WEBHOOK_URL
)
  process.exit(3);

module.exports = {
  MONGO_URI: process.env.MONGO_URI,
  CLIST_BEARER: process.env.CLIST_BEARER,
  WEBHOOK_URL: process.env.WEBHOOK_URL,
  ICONS_URL:
    `${process.env.ICONS_URL}${
      process.env.ICONS_URL.endsWith('/') ? '' : '/'
    }` ||
    'https://raw.githubusercontent.com/iiitkota-codebase/hackremind/main/assets/icons/',
  ONE_PX_IMG:
    process.env.ONE_PX_IMG ||
    'https://github.com/iiitkota-codebase/hackremind/raw/main/assets/520x1-00000000.png',
  CONCURRENCY: Number(process.env.CONCURRENCY) || 4
};
