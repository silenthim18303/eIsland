---
title: VersionAppBloomService
---

# VersionAppBloomService

:::info
Redis-backed bloom filter service for fast app name existence checks, preventing cache penetration on version lookups.
:::

## Overview

`VersionAppBloomService` implements a two-layer probabilistic filter: a Redis bitmap bloom filter for fast rejection, and a Redis Set for exact membership verification. This eliminates false positives from the bloom filter alone. Redis failures use fail-open semantics (return `true`) to avoid blocking legitimate lookups.

## Methods

| Method | Description |
|---|---|
| `mightContain(appName)` | Returns `true` if appName might exist (bloom + exact set check); `false` if definitely absent |
| `add(appName)` | Adds appName to both the bloom bitmap and the exact set |
| `remove(appName)` | Removes appName from the exact set only (bitmap bits are retained) |
| `rebuildFromAppNames(appNames)` | Clears and rebuilds both structures from a collection of app names |

## Two-Layer Check

```
mightContain("my-app")
  ├─ Bloom bitmap: any bit == 0 → return false (definitely absent)
  ├─ Bloom bitmap: all bits == 1 → check exact set
  │   ├─ Exact set: member → return true
  │   └─ Exact set: not member → return false (bloom false positive)
  └─ Redis error → return true (fail-open)
```

## Configuration

| Property | Default | Description |
|---|---|---|
| `version.bloom.key` | `version:app:bloom` | Redis key for the bloom bitmap |
| `version.app.set.key` | `version:app:set` | Redis key for the exact set |
| `version.bloom.bit-size` | `1000003` | Bitmap size (min 1024) |
| `version.bloom.hash-count` | `6` | Number of hash functions (min 2) |

## Hash Strategy

Uses double hashing with CRC32 and Java `hashCode`:

```
offset_i = (hash_crc32 + i * hash_java + i^2) % bitSize
```

:::tip
The exact Set acts as a secondary filter to eliminate bloom false positives, ensuring `mightContain` returns `false` only when the appName is truly absent.
:::
