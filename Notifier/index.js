const got = require('got');
const psl = require('psl');
const { connect, connection } = require('mongoose');
require('dotenv').config();

const getEvents = require('./providers');
const { Event } = require('./models');
const { generateEmbed, retrieveCachedColors } = require('./generators');
const { hosts } = require('./tuners');

module.exports = async (context, timer) => {
  // connect to the mongodb instance
  await connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
  });

  const newEvents = [];

  const storeIfNotExists = async event => {
    if (!hosts[event.host]) return;

    const res = await Event.findOneAndUpdate(
      {
        title: event.title,
        host: event.host,
        url: event.url,
        start: event.start,
        end: event.end
      },
      { $setOnInsert: event },
      { upsert: true, new: true, rawResult: true }
    );

    res.lastErrorObject.updatedExisting || newEvents.push(res.value);
  };

  // retrieve and store first 10 events in the database
  const events = await getEvents();

  // eslint-disable-next-line no-restricted-syntax
  for (const event of events) {
    await storeIfNotExists(event);
    if (newEvents.length > 9) break;
  }

  // generate embeds of new events
  const embeds = await Promise.all(newEvents.map(generateEmbed));

  // array to hold failed pushes
  const failed = [];

  // bare bone webhook
  const webhook = {
    content: null,
    embeds: []
  };

  const colors = retrieveCachedColors();

  // fill color of embeds without color with average color
  // of other embeds with same host
  embeds.forEach((element, i) => {
    if (!element.color)
      embeds[i].color =
        colors[psl.parse(new URL(element.author.url).hostname).domain] || 0;
  });

  // exhaust all embeds one by one
  while (embeds.length > 0) {
    webhook.embeds = embeds.splice(0, 1);

    // embeds whose color cannot be determined are generally not accessible
    if (webhook.embeds[0].color)
      try {
        // push embeds to Discord
        await got.post(process.env.WEBHOOK_URL, {
          json: webhook,
          responseType: 'json'
        });
      } catch (e) {
        context.log.error(e.response || e);
        failed.push(...webhook.embeds);
      }
  }

  // TODO: remove failed embeds from db so that they can be pushed on later runs
  context.log.warn(failed);

  // close connection to the database
  await connection.close();
};
