---
title: AnnouncementConfigMapper
---

# AnnouncementConfigMapper

:::info
MyBatis `@Mapper` interface for the singleton announcement configuration table (single row, ID = 1).
:::

## Methods

| Method | Return | Description |
|---|---|---|
| `selectCurrent()` | `AnnouncementConfig` | Fetch the current announcement (ID = 1) |
| `selectById(id)` | `AnnouncementConfig` | Fetch by ID |
| `insert(config)` | `int` | Insert new announcement config |
| `update(id, title, content, bvid, enabled, startAt, endAt, updatedBy, updatedAt)` | `int` | Update existing announcement |
