<!-- markdownlint-disable MD033 -->

# HackRemind <sup>β</sup>

HackRemind (currently in Beta) is a webhook-based Discord bot that periodically
sends reminders of competitive programming and machine learning contests
hackathons, capture-the-flag challenges and other coding related events.

## How to Use?

There are two ways to use the bot.

<details>
   <summary>I don't want to mess things up 😐</summary>
   <br>

Join [IIIT Kota CodeBase's Discord Server](https://discord.link/CodeBase) and
follow **#upcoming-competitions** to add the channel's updates to your server.

</details>

<details>
   <summary>I kinda like doing things my way!</summary>
   <br>

Head over to [developers' guide](#developers-guide) to learn more.

</details>

## Supported Hosts

<details>
   <summary>Click to expand</summary>
   <br>

- [Advent of Code](https://adventofcode.com)
- [AtCoder](https://atcoder.jp/contests)
- [AZsPCs](http://azspcs.com)
- [Bubble Cup](https://www.bubblecup.org)
- [Reply Challenges](https://challenges.reply.com)
- [CodeChef](https://www.codechef.com/contests)
- [Codeforces](https://codeforces.com/contests)
- [Gym - Codeforces](https://codeforces.com/gyms)
- [Codility](https://app.codility.com/programmers/challenges)
- [CodinGame](https://www.codingame.com/multiplayer)
- [Google](https://codingcompetitions.withgoogle.com)
- [CTFtime](https://ctftime.org)
- [Dare2Compete](https://dare2compete.com)
- [Devfolio](https://devfolio.co/hackathons)
- [Devpost](https://devpost.com/hackathons)
- [DMOJ: Modern Online Judge](https://dmoj.ca/contests)
- [E-Olymp](https://www.e-olymp.com/en/contests)
- [Facebook](https://www.facebook.com/codingcompetitions)
- [HackerEarth](https://www.hackerearth.com)
- [HackerRank](https://www.hackerrank.com)
- [ICFP Programming Contest](http://icfpcontest.org)
- [Kaggle](https://www.kaggle.com/competitions)
- [LeetCode](https://leetcode.com/contest)
- [Kattis](https://open.kattis.com)
- [Project Euler](https://projecteuler.net)
- [Quora](https://www.quora.com/q/quoraprogrammingchallenge)
- [Russian AI Cup](https://russianaicup.ru)
- [Sphere Online Judge (SPOJ)](https://www.spoj.com/contests)
- [TLX](https://tlx.toki.id/contests)
- [Topcoder](https://www.topcoder.com/challenges)

</details>

## Developers' Guide

<details>
   <summary>Click to expand</summary>
   <br>

This bot is an
[Azure Function App](https://azure.microsoft.com/en-in/services/functions/)
using Node.js as runtime. You can customize the following:

### Environment Variables

<!-- markdownlint-disable MD013 -->

|       Variable | Description                                                                                                                                                                                                                                                                                                        |                                     Possible Values, Defaults and Format                                      |
| -------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :-----------------------------------------------------------------------------------------------------------: |
|     `NODE_ENV` | Tells if the app is running in production or not. Note that [`dotenv`](https://www.npmjs.com/package/dotenv) is listed as a dev dependency and won't be available on production to extract variables from `.env` file, even if it is pushed, so you must set this to ensure that the app runs fine on server also. |                           `development` (default) or `production` (case sensitive)                            |
|    `MONGO_URI` | Connection string (URI) of a MongoDB database. A database is required to store information about events which have been already pushed. You don't need to worry about the storage ([512MB](https://www.mongodb.com/pricing) should suffice). The app will automatically remove old records.                        |         [Connection String URI Format](https://docs.mongodb.com/manual/reference/connection-string/)          |
| `CLIST_BEARER` | [CLIST](https://clist.by/api/v2/doc/) (Bearer Token) Authorization Header                                                                                                                                                                                                                                          | [`ApiKey clist-user:api-key`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization#syntax) |
|  `WEBHOOK_URL` | Discord Webhook URL (Ref. [Making a Webhook](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks))                                                                                                                                                                                           |                        `https://discord.com/api/webhooks/{webhook.id}/{webhook.token}`                        |
|    `ICONS_URL` | A location containing icons of all [hosts](Notifier/tuners/hosts.tuner.js). Icon URL of the host is generated by this [mechanism](Notifier/generators/index.js#L20).                                                                                                                                               |         <https://raw.githubusercontent.com/iiitkota-codebase/hackremind/main/assets/icons/> (default)         |
|   `ONE_PX_IMG` | URL containing a 1px transparent image of at least 432px (required to fix width of embeds). (Ref. [Discord.js embed width is unreliable](https://stackoverflow.com/a/66357227/11613622))                                                                                                                           |        <https://github.com/iiitkota-codebase/hackremind/raw/main/assets/520x1-00000000.png> (default)         |
|  `CONCURRENCY` | The max number of tabs your environment can handle in a [Puppeteer](https://www.npmjs.com/package/puppeteer) (Chromium) browser instance. High concurrency may result in failure (like socket hang up, EventEmitter memory leak) depending on free memory, processing power, network speed,..                      |                      any decimal value between `1` to `5` (both inclusive, default `4`)                       |

On a local setup, these settings can be modified by creating a `.env` file at the root of the project. Refer [.env.example](.env.example). On server, [create/modify application settings](https://docs.microsoft.com/en-us/azure/azure-functions/functions-how-to-use-azure-function-app-settings?tabs=portal#settings). Note that, all the settings having a default value are optional. Follow the [official Azure Function App documentation](https://docs.microsoft.com/en-in/azure/azure-functions/) to run and host the bot. You must use Linux consumption plan and deploy using remote build, otherwise Puppeteer won't work. You can modify [this cron expression](Notifier/function.json#L7) to make the bot run at different intervals. If you're stuck on something we might be of some help. Feel free to create a [new discussion](/discussions/new).

<!-- markdownlint-enable MD013 -->

</details>
