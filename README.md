# Tickster x Sanity Starter

Minimal starter for organizers that use Tickster and Sanity.

This starter focuses on one thing:

- import upcoming events for one organizer from Tickster into Sanity
- keep them updated over time
- store them as drafts so editors decide what gets published

It is intended as a clean base that you can copy into an existing Sanity project and build on further.

## What This Starter Is

This is a manual starter, not a fully automated integration.

That means:

- nothing runs by itself after installation
- Tickster imports and updates only happen when you run the provided scripts
- it is meant to be a clean foundation that you can extend inside your own project

If you want full automation later, this starter is the first step. You can add scheduled execution on top of the existing scripts using a cron job, GitHub Actions, scheduled platform jobs, or a separate backend worker.

## What Is Included

- `schemaTypes/tickster/`
  Tickster event schema and sync state schema.
- `scripts/tickster/`
  Import, sync, publish-all, and unpublish-to-drafts scripts.
- `.env.example`
  Safe example of the environment variables you need.
- `deskStructure.ts`
  Optional desk structure entries for Tickster content in Studio.

## Environment Variables

Create a local `.env` file for your machine only. Do not commit it.

```bash
SANITY_PROJECT_ID=your_sanity_project_id
SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_write_token
TICKSTER_ORGANIZER_NAME=Pustervik
TICKSTER_DUMP_API_KEY=your_tickster_api_key
TICKSTER_EVENT_API_KEY=your_tickster_api_key
```

Notes:

- `SANITY_PROJECT_ID` is required.
- `SANITY_DATASET` is required.
- `TICKSTER_ORGANIZER_NAME` is required. Without it, the import should not run.
- The current setup uses the same Tickster API key for both `TICKSTER_DUMP_API_KEY` and `TICKSTER_EVENT_API_KEY`.
- Default value already baked into the code:
  language `sv`.

## Use In An Existing Sanity Project

Copy these parts into your project:

- `schemaTypes/tickster/`
- `scripts/tickster/`
- the Tickster items from `deskStructure.ts` if you want the same Studio navigation
- the Tickster env vars from `.env.example`

Then register the schema types from `schemaTypes/tickster/index.ts` in your own `schemaTypes/index.ts`.

## Studio Structure

The included desk structure exposes:

- `Tickster Events`
- `Tickster Sync State`

If your project already has a custom desk structure, merge these items into it instead of replacing the whole file.

## Commands

First import from the latest dump:

```bash
npm run tickster:import-dump
```

Hourly update against Event API v1:

```bash
npm run tickster:sync-updates
```

Publish all imported Tickster event drafts:

```bash
npm run tickster:publish-all-events
```

Move published Tickster events back to drafts:

```bash
npm run tickster:move-published-to-drafts
```

## Draft / Publish Workflow

Imported Tickster events are stored as drafts.

That means:

- sync does not publish anything automatically
- editors can publish one event at a time in Sanity Studio
- you can publish all imported drafts with `tickster:publish-all-events`
- you can move all published Tickster events back to drafts with `tickster:move-published-to-drafts`

## Suggested Integration Flow

1. Add the Tickster schema files to your Sanity project.
2. Add the Tickster scripts to your repository.
3. Add the required env vars.
4. Run `npm run tickster:import-dump`.
5. Review imported drafts in Studio.
6. Publish the events you want live.
7. Run `npm run tickster:sync-updates` on a schedule, for example once per hour.

## Tickster Notes

The dump import is used for the initial load.

The hourly sync then uses Event API v1 to refresh the imported organizer events.

The Tickster dump documentation says dumps are published around `07:00 UTC` and recommends waiting about one extra hour before consuming the new dump.
