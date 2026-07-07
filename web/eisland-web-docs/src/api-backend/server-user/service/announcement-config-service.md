---
title: AnnouncementConfigService
---

# AnnouncementConfigService

:::info
`@Service` managing the singleton announcement configuration with Redis caching and Markdown-to-HTML rendering.
:::

## Overview

Operates on a single announcement row (ID = 1). Supports time-windowed display (start/end), Markdown content rendering via CommonMark, and a Redis-backed cache layer to minimize database reads on the public endpoint.

## Key Methods

| Method | Description |
|---|---|
| `getAdminConfig()` | Return raw config for admin panel; falls back to default empty config |
| `getPublicAnnouncement()` | Return public payload with rendered HTML; returns `null` if disabled, expired, or not yet started |
| `save(title, content, bvid, enabled, startAt, endAt, updatedBy)` | Create or update the singleton announcement; evicts cache |

## Public Payload Shape

| Field | Type | Description |
|---|---|---|
| `title` | `string` | Announcement title |
| `content` | `string` | Raw Markdown content |
| `contentHtml` | `string` | Rendered HTML from Markdown |
| `contentFormat` | `string` | Always `"markdown"` |
| `bvid` | `string \| null` | Optional Bilibili video ID |
| `startAt` | `string \| null` | ISO-8601 start time |
| `endAt` | `string \| null` | ISO-8601 end time |
| `updatedAt` | `string \| null` | ISO-8601 last update time |

## Cache Strategy

- Cache key: `announcement:current:v3`
- TTL: configurable via `announcement.cache-ttl-seconds` (default 60s, minimum 5s)
- Sentinel value `__NONE__` caches negative results (no active announcement)
- Cache is written on every `save()` and on first `getPublicAnnouncement()` miss

## Validation Rules

- `startAt` must not be after `endAt`
- When enabled, title and content cannot both be blank
- Time strings must be ISO-8601 format (e.g., `2026-04-23T21:30:00`)

## Dependencies

- `AnnouncementConfigMapper` -- database access
- `announcementRedisTemplate` -- Redis caching
- CommonMark `Parser` / `HtmlRenderer` -- Markdown rendering
