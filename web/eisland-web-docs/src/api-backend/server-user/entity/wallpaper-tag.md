---
title: WallpaperTag
---

# WallpaperTag

:::info
Entity representing a wallpaper tag with slug-based deduplication and usage tracking.
:::

## Overview

Tags are auto-created when wallpapers are submitted with new tag names. Each tag has a normalized slug (lowercase, whitespace-stripped) used for deduplication. The `usageCount` field tracks how many wallpapers reference this tag.

## Fields

| Field | Type | Description |
|---|---|---|
| `id` | `Long` | Primary key |
| `name` | `String` | Display name (max 30 chars) |
| `slug` | `String` | Normalized lowercase slug (whitespace stripped, max 30 chars) |
| `creatorUsername` | `String` | Username who first created this tag |
| `enabled` | `Boolean` | Whether the tag is active |
| `usageCount` | `Integer` | Number of wallpapers using this tag |
| `createdAt` | `LocalDateTime` | Creation timestamp |
| `updatedAt` | `LocalDateTime` | Last modification timestamp |
