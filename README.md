# Infoscreen

The screen in Prodeko's guild room. A Vite + React + Tailwind page that runs
full screen in Chrome on a Raspberry Pi.

## What it shows

The main area rotates through these slides:

| Slide | Source | Notes |
| --- | --- | --- |
| Lunch menus (TUAS, A Bloc, T-talo) with opening hours | [Kanttiinit](https://kanttiinit.fi) | Flags a restaurant that closes within 30 minutes. Shown from 07:00 to 18:00 |
| Slides from prodeko.org | `prodeko.org/fi/infoscreen.json` | Edited at prodeko.org/admin → Infoscreen. A slide with a "show until" date disappears after that day. Hidden when there are none |
| Event sign-ups: open now and opening soon | [Ilmo](https://ilmo.prodeko.org) | Read on the server by `server/ilmoSignups.ts`, see the comment there. Hidden when there are none |
| The open election: application count and the newest applications | [vaalit.prodeko.org](https://vaalit.prodeko.org) | Shown only while an election is open |
| Weekly bulletin (viikkotiedote) | viikkotiedote API on old.prodeko.org (the old Django site) | Hidden when there is nothing to show |
| This week's events from the guild's Google calendars (Tapahtumat, Yleiset, Excut, Fuksit, PoRa) | Public iCalendar feeds | Calendars are listed in `src/calendarApi.ts`. Hidden when the week has no events |
| The most-voted active PTER ideas | `pter.prodeko.org/api/top-ideas` | Hidden when there are none |
| HSL departures and disruptions: Aalto metro, Innopolis, Tietotie (bus 52), Maari (tram 15) | Digitransit | Needs `HSL_SUBSCRIPTION_KEY`. Each group shows the walk from TUAS; departures one could not walk to in time are left out |
| Rain radar for southern Finland | [FMI open data](https://en.ilmatieteenlaitos.fi/open-data) | Radar and background map both from FMI's WMS, no key |
| Stock prices: S&P 500 (through the SPY ETF) and the Magnificent 7 | [Twelve Data](https://twelvedata.com) | Needs `TWELVE_DATA_API_KEY` (free plan: 8 symbols/min, 800/day, no indices). Refreshes every 15 minutes. Hidden without data |
| McKinsey logo | `public/` | Sponsor |

The sidebar shows the date and time, a countdown to the next big event
(`src/Countdown.tsx`, hidden when none is ahead), the weather in Otaniemi
([Open-Meteo](https://open-meteo.com)), the next HSL departures, free city
bikes at the four nearest stations ([citybik.es](https://citybik.es), hidden
off-season), and whether someone is watching Kiltiskamera.

Slides that lead somewhere (sign-ups, elections, bulletin, calendar, PTER,
and prodeko.org slides with a link) show a QR code to that page in the bottom
right corner (`src/QrLink.tsx`).

When a source stops answering, its slide or box shows a grey note with the
time of its last successful update (`src/StaleNote.tsx`). From 22:00 to 07:00
the whole screen switches to dark (`src/useNightMode.ts`).

## Running it locally

Node 22 or newer.

```
npm install
cp .env.example .env
npm run dev
```

and open http://localhost:5173. Without the HSL key and the Kiltiskamera
password in `.env` those two parts stay empty; everything else works.

The slides come from prodeko.org. To try slides before they are published,
run the site from a checkout of
[Prodeko/prodeko-org](https://github.com/Prodeko/prodeko-org), edit
`site/data/infoscreen.yaml` there, and point the screen at it:

```
cd ../prodeko-org/site && hugo server     # serves /fi/infoscreen.json
```

with `SLIDES_ORIGIN=http://localhost:1313` in `.env`.

The screen is 1920×1080; size the browser window to match.

## Checks

```
npx @biomejs/biome check .
npm run build
```

The keys and passwords in `.env` are read by the proxy in `vite.config.ts`
when the server starts, not at build time, so `npm run build` needs none of
them and none of them are in the built page.

## Building and deploying

SSH into the Raspberry Pi (who has access, and how, is kept in the board's own documents, not in this public repo), pull the new contents of the repo and run:

```
npm install
npm run build
```

Create a `.env` file in the project root first:

```env
KILTISKAMERA_ON_AIR_PASSWORD=secretpassword
HSL_SUBSCRIPTION_KEY=your_hsl_subscription_key
TWELVE_DATA_API_KEY=your_twelve_data_key
```

The older `VITE_KILTISKAMERA_ON_AIR_PASSWORD` and `VITE_HSL_SUBSCRIPTION_KEY`
names still work, but rename them when you next touch the file. Restart the
service after changing `.env`: the proxy reads it on start.

`secretpassword` value can be looked up from the Azure environment values for kiltiskamera app.

There is a systemd service in /etc/systemd/system/infoscreen.service which runs the preview server. Chrome is started on boot in kiosk mode and the configuration is in ~/.config/autostart/infoscreen.desktop.

The API proxies in `vite.config.ts` are what make the data sources reachable,
so the screen has to be served by `vite preview` (or `vite`), not as plain
static files.
