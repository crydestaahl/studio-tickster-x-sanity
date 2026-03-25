# Tickster x Sanity

This studio contains a `ticksterEvent` document type plus two sync scripts:

- `npm run tickster:import-dump`
  Imports the latest Tickster event dump, resolves the organizer named `Pustervik`, and upserts all matching events into Sanity.
- `npm run tickster:sync-updates`
  Fetches the organizer's current upcoming events from Tickster Event API v1, loads full event details per event id, updates existing Sanity documents, and archives events that are no longer upcoming.
- `npm run web:dev`
  Starts the Next.js frontend that renders the homepage welcome section first and the Tickster event list directly below it.

## Environment variables

Create a local `.env` file for your machine only. The file is ignored by git and must not be committed.

```bash
SANITY_API_TOKEN=your_sanity_write_token
TICKSTER_ORGANIZER_NAME=Pustervik
TICKSTER_DUMP_API_KEY=your_tickster_dump_api_key
TICKSTER_EVENT_API_KEY=your_event_api_key
```

There is a safe example file you can commit and share in the repo:

```bash
.env.example
```

In the current setup, the same Tickster API key is used for both:

- `TICKSTER_DUMP_API_KEY`
- `TICKSTER_EVENT_API_KEY`

Defaults already baked into the code:

- Sanity project id: `c88v7s2i`
- Sanity dataset: `production`
- Language: `sv`

## First import

Run the dump import once:

```bash
npm run tickster:import-dump
```

This stores:

- one `ticksterEvent` document per Tickster event
- one `ticksterSyncState` document with the resolved organizer id, latest dump id, and sync timestamps

## Hourly updates

Run the incremental update on a schedule:

```bash
npm run tickster:sync-updates
```

Recommended flow:

1. Run `tickster:import-dump` once when a new dump is published.
2. Run `tickster:sync-updates` every hour.

The Tickster dump documentation says new dumps are published around 07:00 UTC and recommends waiting roughly one extra hour before consuming the new file.

## Studio structure

The desk now contains:

- `Home Page`: singleton for the content shown in the welcome section on the frontend
- `Tickster Events`: the event list shown in the CMS
- `Tickster Sync State`: a single document holding import/update state

## Frontend

The frontend is built with Next.js in the same project folder.

Run it locally with:

```bash
npm run web:dev
```

Then open `http://localhost:3000`.

The front page reads:

- the `Home Page` singleton for the welcome section
- the active `Tickster Events` documents for the event list directly after the welcome section
