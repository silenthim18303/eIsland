---
title: AppVersionService
---

# AppVersionService

:::info
Service layer for application version CRUD with bloom filter-accelerated lookups and Spring Cache integration.
:::

## Overview

`AppVersionService` manages application version records. On startup, it rebuilds the bloom filter from the database. Read queries use the bloom filter to reject non-existent app names before hitting the database, preventing cache penetration.

## Methods

| Method | Cache | Description |
|---|---|---|
| `getVersion(appName)` | `app-version` | Query version by app name; bloom filter gates DB access |
| `listAll()` | `app-version-list` | Query all version records |
| `createVersion(appName, version, description, downloadUrl)` | Evicts both | Create new version; returns null if app already exists |
| `updateVersion(appName, version, description, downloadUrl)` | Evicts both | Upsert: update existing or create new |
| `deleteVersion(appName)` | Evicts both (conditional) | Delete version; removes from bloom filter |
| `incrementUpdateCount(appName, version)` | Evicts both (conditional) | Increment download/update counter |

## Bloom Filter Integration

```
getVersion("my-app")
  ├─ bloom.mightContain("my-app") == false → return null (no DB hit)
  └─ bloom.mightContain("my-app") == true  → query DB → cache result
```

## Lifecycle

- **Startup**: `rebuildVersionAppBloom()` loads all `appName` values from DB into the bloom filter
- **Create/Update**: Adds `appName` to the bloom filter
- **Delete**: Removes `appName` from the exact set (bitmap bits are retained)

:::warning
App names are trimmed and null/empty values are rejected at the service boundary.
:::
