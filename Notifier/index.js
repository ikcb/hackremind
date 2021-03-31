const got = require('got');
const shell = require('shelljs');
const { connect, connection } = require('mongoose');

const getEvents = require('./providers');
const { config, hosts, preserveTill } = require('./tuners');
const { Event } = require('./models');
const { generateEmbed } = require('./generators');

module.exports = async (context, timer) => {
  // connect to the mongodb instance
  await connect(config.MONGO_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
  });

  // remove events older than 5 days
  Event.remove({ start: { $lt: preserveTill() } });

  const newEvents = [];

  const storeIfNotExists = async event => {
    if (!hosts[event.host]) return;

    const res = await Event.findOneAndUpdate(
      {
        title: event.title,
        host: event.host,
        url: event.url
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
      await got.post(config.WEBHOOK_URL, {
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

  // close zombie chrome processes
  shell.exec('pkill chrome');
};
