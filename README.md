# Infoscreen

## Features to be implemented
- Dashboard
  - Upcoming ilmos (from Ilmo)
  - Kiltiskamera viewers (from Kiltiskamera backend)
  - Ruokalista (from Kanttiinit API)
  - Sponsors
- Full screen rotating slides (image from Django API)
- Time and date

## Scraping Ilmos

We have a `scrape.js` script that fetches the open events in `ilmo.prodeko.org` and saves them to `public/events.json`.

NOTE: this must be set up to run as a job on the device where the Infoscreen app is served.

You can set up a cronjob on Mac or Raspberry Pi with the following:

First, run `sh crontab -e` in the command line to open cron job editor.

Then, add an entry with the following content

```
* * * * * export PATH={INSERT PATH WITH NPM} && cd {INSERT PATH TO APP} && npm run scrape
```

This runs the scraping job **_once every minute_**.

You can replace the {INSERT PATH WITH NPM} with the output of command `echo $PATH` (only the NPM part is relevant).

You can replace {INSERT PATH TO APP} with the output of running command `pwd` in the app directory.

**If you want to add logging** for debug purposes, you can redirect the job output to some file, e.g.,

```
* * * * * export PATH={INSERT PATH WITH NPM} && cd {INSERT PATH TO APP} && npm run scrape >> {INSERT PATH TO APP}/cronjob.log 2>&1
```
---
