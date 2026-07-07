---
title: AppVersionMapper
---

# AppVersionMapper

:::info
MyBatis mapper interface for application version CRUD and update-count tracking.
:::

## Overview

`AppVersionMapper` provides data access for the `app_version` table, supporting lookups by app name, upsert, delete, and atomic update-count increments.

## Methods

| Method | Description | Returns |
|---|---|---|
| `selectByAppName(appName)` | Query version by application name | `AppVersion` or null |
| `selectAll()` | Query all version records | `List<AppVersion>` |
| `insert(appVersion)` | Insert a new version record | Affected rows |
| `updateByAppName(appVersion)` | Update version fields by app name | Affected rows |
| `incrementUpdateCountByAppNameAndVersion(appName, version)` | Atomically increment update_count for a specific app+version | Affected rows |
| `deleteByAppName(appName)` | Delete version record by app name | Affected rows |

:::tip
`incrementUpdateCountByAppNameAndVersion` matches on both `appName` and `version` to ensure the counter only increments for the correct version.
:::
