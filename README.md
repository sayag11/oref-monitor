# OREF Monitor

Real-time alert status monitor for Israel's Home Front Command (Pikud Ha'Oref).

## What it does

OREF Monitor shows the **current real-time status** for any city in Israel based on live data from Pikud Ha'Oref. It tells you whether you should be in a shelter, near a shelter, or if the area is safe.

### Status levels

- **אין איום — ניתן לצאת** — No active threats. Safe to continue normally.
- **ניתן לצאת — הישארו קרוב למרחב מוגן** — You may leave the shelter but stay nearby.
- **צפויות התרעות באזורך** — Advance warning. Alerts expected soon in your area.
- **היכנסו למרחב מוגן — עכשיו!** — Active alert. Enter shelter immediately.
- **הישארו במרחב המוגן** — Stay in shelter until Pikud Ha'Oref says it's safe to leave.

### Features

- Live polling every 5 seconds against Pikud Ha'Oref APIs
- Merges two data sources (real-time alerts + alert history) for accuracy
- Integrity checks on page load to verify data source reliability
- City search with autocomplete
- Default city saved to browser local storage
- Last 6 hours of alert history for your selected city
- Light/dark theme toggle (persisted to local storage)
- Full transparency section explaining data sources and reliability

## Running

**The Pikud Ha'Oref API is only accessible from Israeli IP addresses.** The app must be run on a machine located in Israel.

### Development (hot reload)

```bash
git clone https://github.com/sayag11/oref-monitor.git
cd oref-monitor
npm install
npm start
```

Opens at [http://localhost:3000](http://localhost:3000).

### Production (public URL)

Build and serve with a public tunnel in one command:

```bash
npm run prod
```

This builds the React app, starts the Express production server on port 3001, and opens a public tunnel at:

**https://oref-monitor.loca.lt**

Anyone with this link can access the app — the data flows through your Israeli machine.

You can also run the steps separately:

```bash
npm run build        # build the React app
npm run serve        # start production server on port 3001
npm run tunnel       # expose port 3001 via localtunnel
```

## Architecture

The app runs a local Express server that does two things:
1. Serves the built React frontend
2. Proxies `/api/*` requests to oref.org.il through your Israeli IP

A [localtunnel](https://localtunnel.me) creates a public HTTPS URL that tunnels traffic to your local server.

## Data sources

- `oref.org.il/warningMessages/alert/Alerts.json` — real-time active alerts
- `oref.org.il/warningMessages/alert/History/AlertsHistory.json` — full alert history with all categories
- `alerts-history.oref.org.il/Shared/Ajax/GetAlarmsHistory.aspx` — date-range history (supplementary)

## Disclaimer

This application is **not a substitute** for official Pikud Ha'Oref alerts. Always rely on the official app and sirens for life-safety decisions.
