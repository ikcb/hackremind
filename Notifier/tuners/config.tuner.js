const PRODUCTION = process.env.NODE_ENV === 'production';

// eslint-disable-next-line  global-require, import/no-extraneous-dependencies, node/no-unpublished-require
PRODUCTION || require('dotenv').config();

module.exports = {
  PRODUCTION,
  ...pick(
    process.env,
    'BOT_TOKEN',
    'CHANNEL_ID',
    'CLIST_BEARER',
    'MONGO_URI',
    'SKILLENZA_JWT'
  )
};
