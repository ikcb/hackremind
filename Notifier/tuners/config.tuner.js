const PRODUCTION = process.env.NODE_ENV === 'production';

// eslint-disable-next-line  global-require, import/no-extraneous-dependencies, node/no-unpublished-require
PRODUCTION || require('dotenv').config();

const {
  BOT_TOKEN,
  CHANNEL_ID,
  CLIST_BEARER,
  CONCURRENCY: _CONC = 4,
  ICONS_URL: _ICON = '',
  MONGO_URI = 'mongodb://localhost:27017/hackremind',
  ONE_PX_IMG = 'https://github.com/iiitkota-codebase/hackremind/raw/main/assets/520x1-00000000.png',
  SKILLENZA_JWT
} = process.env;

(BOT_TOKEN && CHANNEL_ID) || process.exit(3);

const CONCURRENCY = Number(_CONC);
const ICONS_URL = _ICON
  ? `${_ICON}${_ICON.endsWith('/') ? '' : '/'}`
  : 'https://raw.githubusercontent.com/iiitkota-codebase/hackremind/main/assets/icons/';

module.exports = {
  BOT_TOKEN,
  CHANNEL_ID,
  CLIST_BEARER,
  CONCURRENCY,
  ICONS_URL,
  MONGO_URI,
  ONE_PX_IMG,
  PRODUCTION,
  SKILLENZA_JWT
};
