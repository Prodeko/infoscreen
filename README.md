# Infoscreen

The screen in Prodeko's guild room. A Vite + React + Tailwind page that runs
full screen in Chrome on a Raspberry Pi.

## What it shows

The main area rotates through these slides:

| Slide | Source | Notes |
| --- | --- | --- |
| Lunch menus (TUAS, A Bloc, T-talo) with opening hours | [Kanttiinit](https://kanttiinit.fi) | Flags a restaurant that closes within 30 minutes |
| Slides from prodeko.org | `prodeko.org/fi/infoscreen.json` | Edited at prodeko.org/admin → Infoscreen. Hidden when there are none |
| Weekly bulletin (viikkotiedote) | prodeko.org viikkotiedote API | Hidden when there is nothing to show |
| HSL departures and disruptions: Aalto metro, Innopolis, tram stop | Digitransit | Needs `VITE_HSL_SUBSCRIPTION_KEY` |
| Stock prices: S&P 500, OMX Helsinki, the Magnificent 7 | Stooq | |
| McKinsey logo | `public/` | Sponsor |

The sidebar always shows the date and time, the next HSL departures, and
whether someone is watching Kiltiskamera.

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

`npm run build` refuses to run without `VITE_KILTISKAMERA_ON_AIR_PASSWORD` and
`VITE_HSL_SUBSCRIPTION_KEY` set. CI runs both with dummy values.

## Building and deploying

SSH into the Raspberry Pi, pull the new contents of the repo and run:

```
npm install
npm run build
```

Create a `.env` file in the project root first:

```env
VITE_KILTISKAMERA_ON_AIR_PASSWORD=secretpassword
VITE_HSL_SUBSCRIPTION_KEY=your_hsl_subscription_key
```

`secretpassword` value can be looked up from the Azure environment values for kiltiskamera app.

There is a systemd service in /etc/systemd/system/infoscreen.service which runs the preview server. Chrome is started on boot in kiosk mode and the configuration is in ~/.config/autostart/infoscreen.desktop.

The API proxies in `vite.config.ts` are what make the data sources reachable,
so the screen has to be served by `vite preview` (or `vite`), not as plain
static files.
