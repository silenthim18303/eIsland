---
title: Identity Verification API
---

# Identity Verification API

:::info
User identity verification endpoints under `/v1/identity/`. Requires JWT authentication with USER, PRO, or ADMIN role.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /v1/identity/start | Start identity verification |
| GET | /v1/identity/query | Query verification result |
| GET | /v1/identity/status | Get verification status |
| GET | /v1/identity/records | List verification records |

:::tip
The verification process is asynchronous. Use the `/status` endpoint to poll for completion after starting verification.
:::
