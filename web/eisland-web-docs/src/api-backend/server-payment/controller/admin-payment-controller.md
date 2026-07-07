---
title: Admin Payment API
---

# Admin Payment API

:::info
Admin payment management endpoints under `/v1/admin/payment/`. Requires `ROLE_ADMIN` authorization.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /v1/admin/payment/orders | List all orders |
| GET | /v1/admin/payment/notify-dlq | List payment notification DLQ entries |
| GET | /v1/admin/payment/receipt-dlq | List receipt DLQ entries |
| PUT | /v1/admin/payment/orders/refresh | Refresh order status |
| PUT | /v1/admin/payment/orders/close | Close order |
| POST | /v1/admin/payment/orders/test | Create test order |
| GET | /v1/admin/payment/config | Get payment configuration |
| PUT | /v1/admin/payment/config | Update payment configuration |

:::warning
Test orders should only be created in development/testing environments.
:::
