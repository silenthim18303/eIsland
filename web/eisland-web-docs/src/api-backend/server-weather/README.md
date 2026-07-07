---
title: Server Weather
icon: cloud
---

# Server Weather

:::info
The `server-weather` module provides weather forecast and alert services with quota management.
:::

## Overview

The server-weather module provides weather-related services:

- **Weather Forecasts** — 3-day weather forecasts
- **Weather Alerts** — Current weather alerts and warnings
- **Quota Management** — API quota monitoring (admin)

:::tip
User endpoints require JWT authentication. Admin endpoints require `ROLE_ADMIN` authorization.
:::

## Module Structure

| Layer | Description |
|---|---|
| [User Weather API](./user-weather-api/) | User-facing weather endpoints |
| [Admin Weather API](./admin-weather-api/) | Admin weather quota management |
