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
| GET | `/v1/admin/agent/model-pricing` | List all model pricing |
| PUT | `/v1/admin/agent/model-pricing` | Create or update model pricing |
| DELETE | `/v1/admin/agent/model-pricing` | Delete model pricing |
| GET | `/v1/admin/agent/service-enabled` | Get agent service status |
| PUT | `/v1/admin/agent/service-enabled` | Enable or disable agent service |
| PUT | `/v1/admin/agent/gift-balance-all` | Gift balance to all users |
| GET | `/v1/admin/agent/usage-stats` | Get usage statistics |
| GET | `/v1/admin/agent/billing-dlq` | List billing DLQ entries |
| PUT | `/v1/admin/agent/billing-dlq/{id}/resolve` | Resolve a DLQ entry |
| GET | `/v1/admin/agent/billing-dlq/pending-count` | Get pending DLQ count |
