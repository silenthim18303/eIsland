---
title: ToolboxSoftware
---

# ToolboxSoftware

:::info
Entity representing a toolbox software entry displayed in the client application.
:::

## Overview

Represents a software item in the toolbox feature. Entries are ordered by `sortOrder` and can be individually enabled or disabled.

## Fields

| Field | Type | Description |
|---|---|---|
| `id` | `Long` | Primary key |
| `name` | `String` | Software display name |
| `description` | `String` | Software description |
| `url` | `String` | Download or homepage URL |
| `iconUrl` | `String` | Icon image URL |
| `sortOrder` | `Integer` | Display order (ascending) |
| `enabled` | `Boolean` | Whether the entry is visible to users |
| `createdAt` | `LocalDateTime` | Creation timestamp |
| `updatedAt` | `LocalDateTime` | Last modification timestamp |

## Interfaces

Implements `Serializable` for cache serialization compatibility.
