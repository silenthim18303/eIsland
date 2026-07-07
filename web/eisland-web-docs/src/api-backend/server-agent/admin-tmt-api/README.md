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
| GET | [/v1/admin/tmt/quota](./get-tmt-quota.md) | Get monthly translation quota |
| GET | [/v1/admin/tmt/pricing](./get-tmt-pricing.md) | List all translation pricing |
| PUT | [/v1/admin/tmt/pricing](./upsert-tmt-pricing.md) | Create or update translation pricing |
| DELETE | [/v1/admin/tmt/pricing](./delete-tmt-pricing.md) | Delete translation pricing |
