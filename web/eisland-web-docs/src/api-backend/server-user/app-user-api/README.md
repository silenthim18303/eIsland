---
title: App User API
---

# App User API

:::info
App user statistics and management endpoints under `/v1/app-users/`. Requires `ROLE_ADMIN` authorization.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /v1/app-users | List app users |
| GET | /v1/app-users/count | Get total user count |
| GET | /v1/app-users/count/normal | Get normal user count |
| GET | /v1/app-users/count/pro | Get PRO user count |
| GET | /v1/app-users/daily-active | Get daily active users |
| GET | /v1/app-users/daily-growth | Get daily user growth |
| POST | /v1/app-users | Add app user |
| DELETE | /v1/app-users | Delete app user |
| GET | /v1/app-users/profile | Get app user profile |
| PUT | /v1/app-users/profile | Update app user profile |
| PUT | /v1/app-users/balance | Set app user balance |

:::tip
Use the statistics endpoints to monitor user growth and engagement metrics.
:::
