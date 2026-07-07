---
title: QWeatherService
---

# QWeatherService

:::info
Server-side proxy for QWeather API with JWT authentication, Redis caching, and monthly request quota enforcement.
:::

## Overview

`QWeatherService` acts as a secure proxy between the client and QWeather APIs. The server holds the Ed25519 private key, signs JWT tokens for authentication, and caches responses in Redis to reduce upstream pressure and latency. A monthly request counter provides circuit-breaker protection.

## API Methods

| Method | Cache Key | Cache TTL | Description |
|---|---|---|---|
| `getThreeDayForecast(location, lang, unit)` | `qweather:daily3d:{loc}:{lang}:{unit}` | 600s (configurable) | 3-day weather forecast |
| `getCurrentAlerts(location, lang)` | `qweather:alerts:{loc}:{lang}` | 180s (configurable) | Current weather alerts/warnings |
| `lookupCity(queryText, lang)` | `qweather:geo:city:{query}:{lang}` | 600s | City geocoding lookup |
| `getMonthlyQuotaStatus()` | (reads counter) | N/A | Returns current month's usage/limit/fused status |

## Authentication Flow

```
Request → generateJwt() → Ed25519 sign → Bearer token → QWeather API
         ↑
  Private key loaded from PEM file (cached in memory)
```

## Monthly Quota

| Property | Value |
|---|---|
| Counter Key | `qweather:quota:provider:qweather:{YYYYMM}` |
| Default Limit | 50,000 requests/month |
| Expiry | End of current UTC month |
| Behavior | Throws `IllegalStateException` when exceeded (circuit breaker) |

## Configuration

| Property | Default | Description |
|---|---|---|
| `QWEATHER_ENABLED` | `true` | Enable/disable the service |
| `QWEATHER_HOST` | `https://devapi.qweather.com` | QWeather API base URL |
| `QWEATHER_PRIVATE_KEY_PATH` | `/etc/eisland/qweather/ed25519-private.pem` | Ed25519 private key file |
| `QWEATHER_PROJECT_ID` | (required) | QWeather project ID (JWT `sub`) |
| `QWEATHER_KEY_ID` | (required) | QWeather key ID (JWT `kid`) |
| `QWEATHER_JWT_ISSUER` | (empty) | JWT issuer claim |
| `QWEATHER_JWT_TTL_SECONDS` | `600` | JWT token lifetime |
| `QWEATHER_DAILY_CACHE_TTL_SECONDS` | `600` | TTL for forecast and city lookup cache |
| `QWEATHER_ALERT_CACHE_TTL_SECONDS` | `180` | TTL for weather alert cache |
| `QWEATHER_MONTHLY_REQUEST_LIMIT` | `50000` | Monthly request cap |
| `QWEATHER_CONNECT_TIMEOUT_MS` | `5000` | HTTP connect timeout |

## Response Handling

- Supports gzip-compressed responses (auto-detected)
- Validates QWeather business code (`code=200`)
- Returns `LinkedHashMap` preserving JSON key order

:::warning
The private key is loaded lazily and cached in memory. Changing the key file path triggers a reload on the next JWT generation.
:::
