---
title: WallpaperMarketService
---

# WallpaperMarketService

:::info
`@Service` managing the full wallpaper marketplace lifecycle: upload, versioning, metadata, ratings, reports, admin review, and multi-CDN asset URL rewriting.
:::

## Overview

Handles wallpaper creation with multi-thumbnail uploads to R2, object replication to COS/OSS, version tracking, tag synchronization, bloom filter maintenance, rating/review systems, and admin moderation workflows. All list and detail endpoints use Spring Cache with `wallpaperCacheManager`.

## Key Methods

### Owner Operations

| Method | Description |
|---|---|
| `create(...)` | Upload wallpaper (original + 3 thumbnails) to R2; create DB record; enqueue replication; sync tags; add to bloom filter |
| `listOwn(...)` | List owner's wallpapers with keyword/type/sort filtering |
| `countOwn(...)` | Count owner's wallpapers |
| `updateOwnerMetadata(...)` | Update title, description, type, tags, copyright |
| `replaceOwnerSource(...)` | Upload new source files; increment version; enqueue replication |
| `deleteOwnerWallpaper(id, ownerUsername)` | Soft-delete; purge R2 assets; remove from bloom filter |

### Public Operations

| Method | Description |
|---|---|
| `listPublished(...)` | List published wallpapers with keyword/type/sort filtering |
| `countPublished(...)` | Count published wallpapers |
| `detail(id, requestedNode, proUser)` | Get wallpaper detail with bloom filter pre-check and URL rewriting |
| `allowUpload(ownerUsername)` | Rate limit check (5 uploads per hour) |
| `apply(id, username, ip, userAgent)` | Apply/download wallpaper; rate-limited (20 per minute) |
| `rate(id, username, score)` | Rate wallpaper (1-5); upserts and recomputes stats |
| `report(id, reporterUsername, reasonType, reasonDetail)` | Report wallpaper; rate-limited (20 per hour) |

### Admin Operations

| Method | Description |
|---|---|
| `listAdmin(...)` | List all wallpapers for admin review |
| `adminUpdateMetadata(...)` | Admin metadata update with status control |
| `adminReview(id, reviewerName, action, reason)` | Approve/reject/delist/relist with audit log |
| `adminDeleteWallpaper(id)` | Admin soft-delete with R2 purge |
| `listReports(...)` | List wallpaper reports |
| `resolveReport(...)` | Resolve a report |
| `listRatings(...)` | List ratings for a wallpaper |
| `adminDeleteRating(...)` | Delete a rating and recompute stats |

## File Validation

| Type | Max Size | Allowed Formats |
|---|---|---|
| Image | 20 MB | Any `image/*` content type |
| Video | 100 MB | `.mp4`, `.mov` with `video/*` content type |

## Cache Names

| Cache | Scope |
|---|---|
| `wallpaper-list` | Published wallpaper listings |
| `wallpaper-my-list` | Owner's own wallpaper listings |
| `wallpaper-admin-list` | Admin wallpaper listings |
| `wallpaper-detail` | Individual wallpaper detail |

## Sort Options

| Value | Description |
|---|---|
| `newest` | By creation date (default) |
| `rating` | By average rating |
| `apply` | By download/apply count |

## Dependencies

- `WallpaperMarketMapper` -- database access
- `WallpaperR2StorageService` -- R2 upload/delete
- `ObjectReplicationTaskService` -- COS/OSS replication queue
- `uploadRateRedisTemplate` -- rate limiting
- `WallpaperTagService` -- tag synchronization
- `WallpaperDetailBloomService` -- bloom filter maintenance
- `StaticAssetUrlService` -- multi-CDN URL rewriting
