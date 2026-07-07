---
title: Announcement API
---

# Announcement API

:::info
System announcement management endpoints under `/v1/`. Admin endpoints require `ROLE_ADMIN` authorization.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /v1/admin/announcement | Get admin announcement config |
| PUT | /v1/admin/announcement | Update admin announcement config |
| GET | /v1/announcement/current | Get current active announcement |

:::tip
The `/v1/announcement/current` endpoint is public and returns the active announcement for all users.
:::
