---
title: Identity Admin API
---

# Identity Admin API

:::info
Admin identity verification management endpoints under `/v1/admin/identity/`. Requires `ROLE_ADMIN` authorization.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /v1/admin/identity/test/start | Start test verification |
| GET | /v1/admin/identity/test/query | Query test verification result |
| GET | /v1/admin/identity/test/status | Get test verification status |
| GET | /v1/admin/identity/test/records | List test verification records |
| GET | /v1/admin/identity/user-info | Get user identity info |

:::warning
The test endpoints are for development/testing purposes only. Use with caution in production.
:::
