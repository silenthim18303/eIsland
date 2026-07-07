---
title: ToolboxSoftwareService
---

# ToolboxSoftwareService

:::info
`@Service` for managing toolbox software entries with Redis-cached public listing.
:::

## Overview

Provides CRUD operations for toolbox software entries. The public `listEnabled()` endpoint uses a Redis cache to avoid repeated database queries. Admin operations (create/update/delete) automatically evict the cache.

## Methods

| Method | Description |
|---|---|
| `listAll()` | Return all software entries (admin view) |
| `listEnabled()` | Return enabled software (public view, Redis-cached) |
| `getById(id)` | Lookup by ID |
| `create(name, description, url, iconUrl, sortOrder, enabled)` | Create a new software entry; evicts cache |
| `update(id, name, description, url, iconUrl, sortOrder, enabled)` | Update existing entry; evicts cache |
| `delete(id)` | Delete entry; evicts cache if successful |

## Cache Strategy

- Cache key: `toolbox:software:list`
- TTL: configurable via `toolbox.software.cache-ttl-seconds` (default 300s, minimum 10s)
- Evicted on any create, update, or delete operation

## Public Payload Shape

Each item in the `listEnabled()` response contains:

| Field | Type | Description |
|---|---|---|
| `id` | `number` | Software ID |
| `name` | `string` | Software name |
| `description` | `string` | Software description |
| `url` | `string` | Download or homepage URL |
| `iconUrl` | `string` | Icon image URL |

## Dependencies

- `ToolboxSoftwareMapper` -- database access
- `toolboxSoftwareRedisTemplate` -- Redis caching
