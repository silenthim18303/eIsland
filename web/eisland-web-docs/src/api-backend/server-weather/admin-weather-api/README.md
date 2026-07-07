---
title: Admin Weather API
---

# Admin Weather API

:::info
Admin weather quota management endpoint under `/v1/admin/weather/`. Requires `ROLE_ADMIN` authorization.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /v1/admin/weather/quota | Get provider quota status |

:::warning
Monitor the quota status to ensure weather API calls do not exceed limits.
:::
