---
title: User Weather API
---

# User Weather API

:::info
User-facing weather endpoints under `/v1/user/weather/`. Requires JWT authentication with USER, PRO, or ADMIN role.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /v1/user/weather/daily-3d | Get 3-day weather forecast |
| GET | /v1/user/weather/alerts | Get current weather alerts |

:::tip
Use the forecast endpoint to get weather predictions for the next 3 days.
:::
