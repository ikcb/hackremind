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

Join [our Discord Server][1] and follow **#upcoming-competitions** to add the
channel's notifications to your server.

After adding bot to your server, you may like to change its name or avatar. You
can modify them by editing your channel (little cogwheel icon alongside channel
name). Open **Integrations** > **Channels Followed** >
**CodeBase #upcoming-competitions** to get the required settings.

![59]

</details>

<details>
   <summary>I kinda like doing things my way!</summary>
   <br>

Head over to [developers' guide][2] to learn more and deploy your version of
the bot to⠀[![58]][57]

</details>

## Supported Hosts

<details>
   <summary>Click to expand</summary>
   <br>

- [Advent of Code][3]
- [AtCoder][4]
- [AZsPCs][5]
- [Bubble Cup][6]
- [Reply Challenges][7]
- [CodeChef][8]
- [Codeforces][9]
- [Gym - Codeforces][10]
- [Codility][11]
- [CodinGame][12]
- [Google][13]
- [CTFtime][14]
- [Dare2Compete][15]
- [Devfolio][16]
- [Devpost][17]
- [DMOJ: Modern Online Judge][18]
- [E-Olymp][19]
- [Facebook][20]
- [HackerEarth][21]
- [HackerRank][22]
- [ICFP Programming Contest][23]
- [Kaggle][24]
- [LeetCode][25]
- [Kattis][26]
- [Project Euler][27]
- [Quora][28]
- [Russian AI Cup][29]
- [Sphere Online Judge (SPOJ)][30]
- [TLX][31]
- [Topcoder][32]

</details>

## Developers' Guide

<details>
   <summary>Click to expand</summary>
   <br>

This bot is an [Azure Function App][33] using Node.js as runtime. You can
customize the following:

### Environment Variables

<!-- markdownlint-disable MD013 -->

|       Variable | Description                                                                                                                                                                                                                                                                      |                         Possible Values, Defaults and Format                         |
| -------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------: |
|     `NODE_ENV` | Tells if the app is running in production or not. Note that [`dotenv`][34] is listed as a dev dependency and won't be available on production to extract variables from `.env` file, even if it is pushed, so you must set this to ensure that the app runs fine on server also. |                       `development` (default) or `production`                        |
|    `MONGO_URI` | Connection string (URI) of a MongoDB database. A database is required to store information about events which have been already pushed. You don't need to worry about the storage ([512MB][35] should suffice). The app will automatically remove old records.                   | [Connection String URI Format][36] (default: `mongodb://localhost:27017/hackremind`) |
| `CLIST_BEARER` | [CLIST][37] (Bearer Token) Authorization Header                                                                                                                                                                                                                                  |                          [`ApiKey clist-user:api-key`][38]                           |
|  `WEBHOOK_URL` | Discord Webhook URL (Ref. [Making a Webhook][39])                                                                                                                                                                                                                                |                         `https://discord.com/api/webhooks/…`                         |
|    `ICONS_URL` | A location containing icons of all [hosts][40]. Icon URL of the host is generated by this [mechanism][41].                                                                                                                                                                       |                                    [default][42]                                     |
|   `ONE_PX_IMG` | URL containing a 1px transparent image of at least 432px (required to fix width of embeds). (Ref. [Discord.js embed width is unreliable][43])                                                                                                                                    |                                    [default][44]                                     |
|  `CONCURRENCY` | The max number of tabs your environment can handle in a [Puppeteer][45] (Chromium) browser instance. High concurrency may result in failure (like socket hang up, EventEmitter memory leak) depending on free memory, processing power, network speed,..                         |          any decimal value between `1` to `5` (both inclusive, default `4`)          |

<!-- markdownlint-enable MD013 -->

Locally, one can set/modify environment variables in numerous ways. Some of them
are:

- Create a `.env` at root of the folder. [Ref.][46]
- Set variables in the shell itself. Ref.:[1][51],[2][52],[3][53]
- Use `local.settings.json`. Ref.:[SO][54],[docs][55]

On server, you need to specify [application settings][47]. Apart from the
methods mentioned in that article, one can use this [VSCode extension][56] or
use `--publish-local-settings` switch when you publish.

_All the environment variables having a default value are optional._

### Deployment Notes

**Puppeteer works only on Linux consumption plan and when deployed using
remote build.**

You can modify [this cron expression][49] if you want to run the bot at
different intervals. It currently runs every 2 hours.

If you're stuck on something we might be of some help. Feel free to create a
[new discussion][50].

</details>

[1]: https://discord.link/CodeBase
[2]: #developers-guide
[3]: https://adventofcode.com
[4]: https://atcoder.jp/contests
[5]: http://azspcs.com
[6]: https://www.bubblecup.org
[7]: https://challenges.reply.com
[8]: https://www.codechef.com/contests
[9]: https://codeforces.com/contests
[10]: https://codeforces.com/gyms
[11]: https://app.codility.com/programmers/challenges
[12]: https://www.codingame.com/multiplayer
[13]: https://codingcompetitions.withgoogle.com
[14]: https://ctftime.org
[15]: https://dare2compete.com
[16]: https://devfolio.co/hackathons
[17]: https://devpost.com/hackathons
[18]: https://dmoj.ca/contests
[19]: https://www.e-olymp.com/en/contests
[20]: https://www.facebook.com/codingcompetitions
[21]: https://www.hackerearth.com
[22]: https://www.hackerrank.com
[23]: http://icfpcontest.org
[24]: https://www.kaggle.com/competitions
[25]: https://leetcode.com/contest
[26]: https://open.kattis.com
[27]: https://projecteuler.net
[28]: https://www.quora.com/q/quoraprogrammingchallenge
[29]: https://russianaicup.ru
[30]: https://www.spoj.com/contests
[31]: https://tlx.toki.id/contests
[32]: https://www.topcoder.com/challenges
[33]: https://azure.microsoft.com/en-in/services/functions/
[34]: https://www.npmjs.com/package/dotenv
[35]: https://www.mongodb.com/pricing
[36]: https://docs.mongodb.com/manual/reference/connection-string/
[37]: https://clist.by/api/v2/doc/
[38]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization#syntax
[39]: https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks
[40]: Notifier/tuners/hosts.tuner.js
[41]: Notifier/generators/index.js#L20
[42]: https://raw.githubusercontent.com/iiitkota-codebase/hackremind/main/assets/icons/
[43]: https://stackoverflow.com/a/66357227/11613622
[44]: https://github.com/iiitkota-codebase/hackremind/raw/main/assets/520x1-00000000.png
[45]: https://www.npmjs.com/package/puppeteer
[46]: .env.example
[47]: https://docs.microsoft.com/en-us/azure/azure-functions/functions-how-to-use-azure-function-app-settings#settings
[48]: https://docs.microsoft.com/en-in/azure/azure-functions/
[49]: Notifier/function.json#L7
[50]: https://github.com/iiitkota-codebase/hackremind/discussions/new
[51]: https://askubuntu.com/q/58814/1115724
[52]: https://stackoverflow.com/q/714877/11613622
[53]: https://superuser.com/q/79612/1081541
[54]: https://stackoverflow.com/a/47434842/11613622
[55]: https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local#local-settings-file
[56]: https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions
[57]: https://azure.microsoft.com/en-in/overview/
[58]: https://img.shields.io/badge/Microsoft%20Azure-555555?style=for-the-badge&logo=microsoft-azure
[59]: https://user-images.githubusercontent.com/40380293/113475921-b3a67280-9495-11eb-8735-7fd009461999.png
