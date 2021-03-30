const got = require('got');
const { connect, connection } = require('mongoose');

const getEvents = require('./providers');
const { Event } = require('./models');
const { generateEmbed } = require('./generators');
const { hosts } = require('./tuners');
const { MONGO_URI, WEBHOOK_URL } = require('./config');

module.exports = async (context, timer) => {
  // connect to the mongodb instance
  await connect(MONGO_URI, {
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

  // retrieve and store first 5 events in the database
  const events = await getEvents();

  // eslint-disable-next-line no-restricted-syntax
  for (const event of events) {
    await storeIfNotExists(event);
    if (newEvents.length > 4) break;
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

  // exhaust all embeds one by one
  while (embeds.length > 0) {
    webhook.embeds = embeds.splice(0, 1);

    try {
      // push embeds to Discord
      await got.post(WEBHOOK_URL, {
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
