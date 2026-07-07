---
title: Admin Agent API
---

# Admin Agent API

:::info
Agent management endpoints under `/v1/admin/agent/`. All require `ROLE_ADMIN` authorization.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | [/v1/admin/agent/model-pricing](./get-model-pricing.md) | List all model pricing |
| PUT | [/v1/admin/agent/model-pricing](./upsert-model-pricing.md) | Create or update model pricing |
| DELETE | [/v1/admin/agent/model-pricing](./delete-model-pricing.md) | Delete model pricing |
| GET | [/v1/admin/agent/service-enabled](./get-service-enabled.md) | Get agent service status |
| PUT | [/v1/admin/agent/service-enabled](./set-service-enabled.md) | Enable or disable agent service |
| PUT | [/v1/admin/agent/gift-balance-all](./gift-balance-all.md) | Gift balance to all users |
| GET | [/v1/admin/agent/usage-stats](./get-usage-stats.md) | Get usage statistics |
| GET | [/v1/admin/agent/billing-dlq](./get-billing-dlq.md) | List billing DLQ entries |
| PUT | [/v1/admin/agent/billing-dlq/{id}/resolve](./resolve-billing-dlq.md) | Resolve a DLQ entry |
| GET | [/v1/admin/agent/billing-dlq/pending-count](./get-dlq-pending-count.md) | Get pending DLQ count |
