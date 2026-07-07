---
title: Admin Email DLQ API
---

# Admin Email DLQ API

:::info
Admin email notification dead letter queue management endpoint under `/v1/admin/email/`. Requires `ROLE_ADMIN` authorization.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /v1/admin/email/notify-dlq | List email notification DLQ entries |

:::warning
This endpoint is for monitoring failed email notifications. DLQ entries should be investigated and resolved manually.
:::
