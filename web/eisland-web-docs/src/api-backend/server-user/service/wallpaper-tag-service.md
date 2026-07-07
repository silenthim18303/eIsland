---
title: WallpaperTagService
---

# WallpaperTagService

:::info
`@Service` managing wallpaper tags with automatic creation, slug-based deduplication, and usage count tracking.
:::

## Overview

Handles tag lifecycle for the wallpaper marketplace. Tags are auto-created on first use, deduplicated by slug (lowercase, whitespace-stripped), and their `usage_count` is recomputed whenever references change.

## Key Methods

| Method | Description |
|---|---|
| `syncTagsForWallpaper(wallpaperId, tagsText, creator)` | Parse comma-separated tags, create new tags, update refs, recompute usage counts; returns normalized tagsText |
| `clearWallpaperTags(wallpaperId)` | Remove all tag refs for a wallpaper; recompute affected usage counts |
| `search(keyword, limit)` | Search tags by keyword (max 50 results) |
| `listAdmin(keyword, enabled, page, pageSize)` | Admin tag listing with pagination |
| `countAdmin(keyword, enabled)` | Count tags for admin listing |
| `updateName(id, name)` | Rename a tag; rejects if slug conflicts with another tag |
| `setEnabled(id, enabled)` | Enable/disable a tag |
| `deleteTag(id)` | Delete tag and all its refs |
| `listTagsByWallpaper(wallpaperId)` | List tags for a specific wallpaper |

## Constants

| Constant | Value | Description |
|---|---|---|
| `MAX_TAG_LENGTH` | `30` | Maximum characters per tag name |
| `MAX_TAG_COUNT_PER_WALLPAPER` | `10` | Maximum tags per wallpaper |

## Slug Generation

1. Trim whitespace
2. Convert to lowercase
3. Strip all whitespace characters
4. Truncate to 30 characters

## Tag Sync Flow

1. Fetch previous tag IDs for the wallpaper
2. Delete all existing refs for the wallpaper
3. Parse and normalize the new tagsText (comma-separated, deduplicated by slug)
4. For each tag: find by slug or create new; insert ref
5. Collect all affected tag IDs (previous + new)
6. Recompute `usage_count` for each affected tag

## Dependencies

- `WallpaperTagMapper` -- database access
