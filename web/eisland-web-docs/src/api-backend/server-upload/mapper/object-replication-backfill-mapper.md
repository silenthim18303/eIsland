---
title: ObjectReplicationBackfillMapper
---

# ObjectReplicationBackfillMapper

:::info
MyBatis mapper interface for reading legacy resource rows during cross-provider backfill migration.
:::

## Overview

`ObjectReplicationBackfillMapper` provides read-only queries against existing business tables (users, wallpapers, feedback) to identify objects that need replication. Each method returns rows after a given ID for cursor-based pagination.

## Methods

| Method | Source Table | Description | Returns |
|---|---|---|---|
| `listUserAvatarRows(afterId, limit)` | User table | Scan user avatar URLs (includes role for admin detection) | `List<Map>` |
| `listWallpaperAssetRows(afterId, limit)` | Wallpaper table | Scan wallpaper URLs (original + 3 thumbnail sizes) | `List<Map>` |
| `listIssueFeedbackRows(afterId, limit)` | Feedback table | Scan feedback attachment URLs (log + screenshot) | `List<Map>` |

## Cursor Pagination

All methods use `WHERE id > #{afterId} ORDER BY id LIMIT #{limit}` for efficient, resumable scanning. The checkpoint system stores the last processed ID.

:::tip
These queries return raw `Map<String, Object>` rather than typed entities to avoid coupling the replication module to business domain models.
:::
