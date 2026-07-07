---
title: WallpaperAsset
---

# WallpaperAsset

:::info
Entity representing a wallpaper asset in the marketplace, supporting images and videos with multi-resolution thumbnails.
:::

## Overview

Represents a wallpaper submission in the marketplace. Each asset has an original file plus three thumbnail sizes (320px, 720px, 1280px). Assets progress through a review workflow (pending -> published/rejected/delisted) and track ratings, downloads, and apply counts.

## Fields

| Field | Type | Description |
|---|---|---|
| `id` | `Long` | Primary key |
| `ownerUsername` | `String` | Uploader username |
| `title` | `String` | Wallpaper title (max 120 chars) |
| `description` | `String` | Description (max 2000 chars) |
| `type` | `String` | Asset type: `"image"` or `"video"` |
| `status` | `String` | Review status: `pending`/`published`/`rejected`/`delisted` |
| `originalUrl` | `String` | Original file URL (R2) |
| `thumb320Url` | `String` | 320px thumbnail URL |
| `thumb720Url` | `String` | 720px thumbnail URL |
| `thumb1280Url` | `String` | 1280px thumbnail URL |
| `width` | `Integer` | Image/video width in pixels |
| `height` | `Integer` | Image/video height in pixels |
| `durationMs` | `Long` | Video duration in milliseconds (null for images) |
| `frameRate` | `BigDecimal` | Video frame rate (null for images) |
| `fileSize` | `Long` | Original file size in bytes |
| `tagsText` | `String` | Comma-separated tag names (max 500 chars) |
| `copyrightDeclared` | `Boolean` | Whether the uploader declared copyright ownership |
| `copyrightInfo` | `String` | Copyright details (max 500 chars) |
| `ratingAvg` | `BigDecimal` | Average rating (0-5) |
| `ratingCount` | `Long` | Number of ratings |
| `downloadCount` | `Long` | Total download count |
| `applyCount` | `Long` | Total apply (set as wallpaper) count |
| `currentVersion` | `Integer` | Current version number |
| `deleted` | `Boolean` | Soft-delete flag |
| `createdAt` | `LocalDateTime` | Upload timestamp |
| `updatedAt` | `LocalDateTime` | Last modification timestamp |
| `publishedAt` | `LocalDateTime` | Publication timestamp (null if not published) |
