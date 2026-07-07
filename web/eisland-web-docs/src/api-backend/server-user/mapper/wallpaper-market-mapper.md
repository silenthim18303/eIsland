---
title: WallpaperMarketMapper
---

# WallpaperMarketMapper

:::info
MyBatis `@Mapper` interface for the wallpaper marketplace, covering assets, versions, video metadata, ratings, reports, and review logs.
:::

## Asset Operations

| Method | Return | Description |
|---|---|---|
| `insertAsset(asset)` | `int` | Create new wallpaper asset |
| `selectAssetById(id)` | `Map` | Get asset by ID (as Map for flexible projection) |
| `listActiveAssetIds()` | `List<Long>` | List all non-deleted asset IDs (for bloom filter rebuild) |
| `markOwnerDeleted(id, ownerUsername, updatedAt)` | `int` | Owner soft-delete |
| `markAdminDeleted(id, updatedAt)` | `int` | Admin soft-delete |

## Version Operations

| Method | Return | Description |
|---|---|---|
| `insertVersion(...)` | `int` | Create new version record |
| `listVersionAssetUrls(wallpaperId)` | `List<Map>` | List all version URLs for R2 cleanup |

## Video Metadata

| Method | Return | Description |
|---|---|---|
| `upsertVideoMeta(wallpaperId, durationMs, frameRate, createdAt, updatedAt)` | `int` | Insert or update video metadata |
| `deleteVideoMetaByWallpaperId(wallpaperId)` | `int` | Delete video metadata |

## Listing & Search

| Method | Return | Description |
|---|---|---|
| `listPublished(keyword, type, sortBy, offset, limit)` | `List<Map>` | Public listing with filters |
| `countPublished(keyword, type)` | `long` | Count for public listing |
| `listMine(ownerUsername, keyword, type, sortBy, offset, limit)` | `List<Map>` | Owner's listing |
| `countMine(ownerUsername, keyword, type)` | `long` | Count for owner's listing |
| `listAdmin(keyword, type, status, offset, limit)` | `List<Map>` | Admin listing |
| `replaceOwnerSource(...)` | `int` | Replace source files (version increment) |

## Metadata Updates

| Method | Return | Description |
|---|---|---|
| `updateOwnerMetadata(...)` | `int` | Owner metadata update |
| `updateAdminMetadata(...)` | `int` | Admin metadata update with status control |
| `updateStatusByAdmin(id, status, updatedAt, publishedAt)` | `int` | Admin status change |

## Ratings & Reports

| Method | Return | Description |
|---|---|---|
| `upsertRating(wallpaperId, username, score, createdAt, updatedAt)` | `int` | Insert or update rating |
| `deleteRatingById(id)` | `int` | Delete a rating |
| `recomputeRatingStats(wallpaperId)` | `int` | Recompute avg/count from ratings |
| `listRatings(wallpaperId, offset, limit)` | `List<Map>` | List ratings |
| `insertReport(...)` | `int` | Create report |
| `countPendingReportByUser(wallpaperId, reporterUsername)` | `int` | Check for duplicate pending reports |
| `listReports(status, offset, limit)` | `List<Map>` | List reports |
| `resolveReport(id, status, resolverName, resolutionNote, resolvedAt)` | `int` | Resolve a report |
| `insertReviewLog(wallpaperId, action, reviewerName, reason, createdAt)` | `int` | Create review audit log |

## Apply / Download

| Method | Return | Description |
|---|---|---|
| `incrementApplyAndDownload(id)` | `int` | Increment both apply and download counts |
| `incrementDownloadOnly(id)` | `int` | Increment download count only |
| `countApplyByUser(wallpaperId, username)` | `int` | Check if user already applied |
| `insertApplyLog(...)` | `int` | Record apply/download event |
