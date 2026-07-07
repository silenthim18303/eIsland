---
title: Service Status API
---

# Service Status API

:::info
Service health and status endpoints under `/v1/service-status/`. Read endpoints are public. Update endpoints require `ROLE_ADMIN` authorization.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /v1/service-status | Get current service status |
| GET | /v1/service-status/list | List all service statuses |
| PUT | /v1/service-status | Update service status |

:::tip
The status endpoint is used by monitoring systems to check service health.
:::
