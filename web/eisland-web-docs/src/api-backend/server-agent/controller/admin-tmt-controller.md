---
title: Admin TMT API
---

# Admin TMT API

:::info
Translation service management endpoints under `/v1/admin/tmt/`. All require `ROLE_ADMIN` authorization.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/v1/admin/tmt/quota` | Get monthly translation quota |
| GET | `/v1/admin/tmt/pricing` | List all translation pricing |
| PUT | `/v1/admin/tmt/pricing` | Create or update translation pricing |
| DELETE | `/v1/admin/tmt/pricing` | Delete translation pricing |
