---
title: AppVersion
---

# AppVersion

:::info
Serializable entity representing an application version record with download metadata.
:::

## Overview

`AppVersion` maps to the `app_version` table. Each row tracks the current version, description, and download URL for a named application, along with an update counter.

## Fields

| Field | Type | Description |
|---|---|---|
| `id` | `Long` | Primary key |
| `appName` | `String` | Unique application name |
| `version` | `String` | Current version string |
| `description` | `String` | Version description or changelog |
| `downloadUrl` | `String` | Download link |
| `updateCount` | `Long` | Number of times this version has been downloaded/updated |
| `updatedAt` | `LocalDateTime` | Last update timestamp |

## Constructors

| Constructor | Description |
|---|---|
| `AppVersion()` | Default no-arg constructor |
| `AppVersion(appName, version, description, downloadUrl)` | Full constructor; sets `updateCount=0` and `updatedAt=now` |

:::tip
The entity implements `Serializable` for Spring Cache compatibility.
:::
