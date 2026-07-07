---
title: AnnouncementConfig
---

# AnnouncementConfig

:::info
Singleton entity representing the system announcement configuration, stored as a single row (ID = 1).
:::

## Overview

Represents the platform-wide announcement that can be displayed to users. Supports time-windowed display, Markdown content, and an optional Bilibili video reference.

## Fields

| Field | Type | Description |
|---|---|---|
| `id` | `Long` | Primary key (always `1`) |
| `title` | `String` | Announcement title |
| `content` | `String` | Announcement body (Markdown) |
| `bvid` | `String` | Optional Bilibili video BV ID |
| `enabled` | `Boolean` | Whether the announcement is active |
| `startAt` | `LocalDateTime` | Display start time (null = immediate) |
| `endAt` | `LocalDateTime` | Display end time (null = no expiry) |
| `updatedBy` | `String` | Username of last editor |
| `updatedAt` | `LocalDateTime` | Last modification timestamp |
