---
title: Version API
---

# Version API

:::info
Version management endpoints under `/v1/version/`. Some endpoints require `ROLE_ADMIN` authorization.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /v1/version/list | List all versions |
| GET | /v1/version | Get specific version |
| PUT | /v1/version | Update version (admin) |
| DELETE | /v1/version | Delete version (admin) |
| POST | /v1/version | Create version (admin) |
| POST | /v1/version/update-count | Increment update count |

:::tip
Use the `/list` endpoint to check for available updates.
:::
