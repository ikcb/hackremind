const PRODUCTION = process.env.NODE_ENV === 'production';

// eslint-disable-next-line  global-require, import/no-extraneous-dependencies, node/no-unpublished-require
PRODUCTION || require('dotenv').config();

const {
  BOT_TOKEN,
  CHANNEL_ID,
  CLIST_BEARER,
  CONCURRENCY: _CONC = 4,
  ICONS_URL: _ICON = '',
  INTERNATIONAL: _INT = false,
  MONGO_URI = 'mongodb://localhost:27017/hackremind',
  ONE_PX_IMG = 'https://github.com/iiitkota-codebase/hackremind/raw/main/assets/520x1-00000000.png',
  SKILLENZA_JWT,
  TIME_WINDOW: _TIME = 3
} = process.env;

(BOT_TOKEN && CHANNEL_ID) || process.exit(3);

const CONCURRENCY = Number(_CONC);
const ICONS_URL = _ICON
  ? `${_ICON}${_ICON.endsWith('/') ? '' : '/'}`
  : 'https://raw.githubusercontent.com/iiitkota-codebase/hackremind/main/assets/icons/';
const INTERNATIONAL = _INT.toLowerCase().trim() === 'true';
const TIME_WINDOW = Number(_TIME);

module.exports = {
  BOT_TOKEN,
  CHANNEL_ID,
  CLIST_BEARER,
  CONCURRENCY,
  ICONS_URL,
  INTERNATIONAL,
  MONGO_URI,
  ONE_PX_IMG,
  PRODUCTION,
  SKILLENZA_JWT,
  TIME_WINDOW
};
