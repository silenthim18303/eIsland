---
title: WallpaperTagMapper
---

# WallpaperTagMapper

:::info
MyBatis `@Mapper` interface for wallpaper tags and tag-wallpaper reference tables.
:::

## Tag Operations

| Method | Return | Description |
|---|---|---|
| `insertTag(tag)` | `int` | Create new tag |
| `selectBySlug(slug)` | `WallpaperTag` | Lookup by normalized slug |
| `selectById(id)` | `WallpaperTag` | Lookup by ID |
| `searchByKeyword(keyword, limit)` | `List<Map>` | Search tags by keyword |
| `listAdmin(keyword, enabled, offset, limit)` | `List<Map>` | Admin listing with filters |
| `countAdmin(keyword, enabled)` | `long` | Count for admin listing |
| `updateName(id, name, slug, updatedAt)` | `int` | Rename tag |
| `updateEnabled(id, enabled, updatedAt)` | `int` | Enable/disable tag |
| `deleteTag(id)` | `int` | Delete tag |
| `recomputeUsageCount(id)` | `int` | Recompute usage_count from refs |

## Reference Operations

| Method | Return | Description |
|---|---|---|
| `insertRef(wallpaperId, tagId, createdAt)` | `int` | Create tag-wallpaper reference |
| `deleteRefsByWallpaper(wallpaperId)` | `int` | Remove all refs for a wallpaper |
| `deleteRefsByTag(tagId)` | `int` | Remove all refs for a tag |
| `listTagIdsByWallpaper(wallpaperId)` | `List<Long>` | Get tag IDs for a wallpaper |
| `listTagsByWallpaper(wallpaperId)` | `List<Map>` | Get tag details for a wallpaper |
