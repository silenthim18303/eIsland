---
title: WallpaperDetailBloomService
---

# WallpaperDetailBloomService

:::info
`@Service` implementing a Redis-backed bloom filter with exact-set verification for wallpaper detail ID existence checks.
:::

## Overview

Pre-filters invalid wallpaper IDs before they reach the database, reducing cache-miss pressure from random or fabricated ID requests. Uses a two-layer approach identical to `UserBanBloomService`: bloom filter for fast negatives, Redis Set for exact verification.

## Methods

| Method | Description |
|---|---|
| `mightContain(id)` | Check if wallpaper ID exists (bloom filter + exact set) |
| `add(id)` | Add ID to both bloom filter and exact set |
| `remove(id)` | Remove ID from exact set only |
| `rebuildFromIds(ids)` | Rebuild entire bloom filter from a collection of active IDs |

## Configuration Properties

| Property | Default | Description |
|---|---|---|
| `wallpaper.detail.bloom.key` | `wallpaper:detail:bloom` | Redis key for bloom filter bitmap |
| `wallpaper.detail.set.key` | `wallpaper:detail:set` | Redis key for exact ID set |
| `wallpaper.detail.bloom.bit-size` | `2000003` | Bloom filter bit array size (minimum 1024) |
| `wallpaper.detail.bloom.hash-count` | `6` | Number of hash functions (minimum 2) |

## Hash Strategy

- Hash 1: CRC32 of stringified ID
- Hash 2: Java `String.hashCode()` with `#wallpaper-detail` salt
- Combined: `hash1 + i * hash2 + i * i` (double hashing)

## Lifecycle

- `rebuildFromIds()` is called during `WallpaperMarketService` construction to initialize the filter from all active wallpaper IDs
- `add()` is called when a new wallpaper is created
- `remove()` is called when a wallpaper is deleted

## Dependencies

- `wallpaperDetailBloomRedisTemplate` -- Redis operations on dedicated DB 3
