---
title: ObjectReplicationBackfillService
---

# ObjectReplicationBackfillService

:::info
Scheduled service for bulk backfilling legacy objects across storage providers and replaying dead-lettered replication tasks.
:::

## Overview

`ObjectReplicationBackfillService` performs two scheduled operations: (1) scanning existing database records (user avatars, wallpaper assets, issue feedback) and enqueuing replication tasks for objects that haven't been replicated yet, and (2) replaying DLQ tasks back to the processing queue.

## Scheduled Tasks

| Task | Interval Config | Default | Description |
|---|---|---|---|
| `backfillLegacyResources()` | `object-replication.backfill-interval-ms` | `5000` | Scan and enqueue legacy objects |
| `replayDlqTasks()` | `object-replication.dlq-replay-interval-ms` | `15000` | Replay dead-lettered tasks |

## Backfill Scopes

| Scope | Checkpoint Key | Source Table | Fields Replicated |
|---|---|---|---|
| User Avatars | `backfill_user_avatar` | User table | `avatar` URL |
| Wallpaper Assets | `backfill_wallpaper_asset` | Wallpaper table | `originalUrl`, `thumb320Url`, `thumb720Url`, `thumb1280Url` |
| Issue Feedback | `backfill_issue_feedback` | Feedback table | `feedbackLogUrl`, `feedbackScreenshotUrl` |

## Checkpoint System

Each backfill scope tracks progress via `object_replication_checkpoint`:

| Field | Description |
|---|---|
| `checkpointKey` | Scope identifier |
| `lastId` | Last processed row ID |
| `status` | `pending` / `running` / `done` |

Resumes from `lastId` on restart; marks `done` when no more rows are found.

## URL Resolution

The service resolves source URLs to `StorageUploadResult` by matching against all configured provider domains and endpoints:

- R2: public domain, endpoint+bucket, `*.r2.dev`
- OSS: custom domain, virtual-host style
- COS: custom domain, default host (`{bucket}.cos.{region}.myqcloud.com`)

## Configuration

| Property | Default | Description |
|---|---|---|
| `object-replication.backfill-enabled` | `false` | Enable backfill scanning |
| `object-replication.backfill-batch-size` | `200` | Rows per batch |
| `object-replication.dlq-replay-enabled` | `false` | Enable DLQ replay |
| `object-replication.dlq-replay-batch-size` | `100` | Tasks per replay batch |

:::warning
Both backfill and DLQ replay are disabled by default. Enable them explicitly during migration windows.
:::
