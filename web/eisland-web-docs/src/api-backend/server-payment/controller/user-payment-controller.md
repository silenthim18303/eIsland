---
title: User Payment API
---

# User Payment API

:::info
User-facing payment endpoints under `/v1/user/payment/`. Requires JWT authentication with USER, PRO, or ADMIN role.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /v1/user/payment/orders/pro-month | Create Pro monthly subscription order |
| POST | /v1/user/payment/orders/agent-recharge | Create agent balance recharge order |
| GET | /v1/user/payment/agent/balance | Get agent balance |
| GET | /v1/user/payment/pricing/pro-month | Get Pro monthly pricing |
| GET | /v1/user/payment/channels | Get available payment channels |
| GET | /v1/user/payment/orders/{outTradeNo} | Get order details |
| GET | /v1/user/payment/orders | List user orders |
| POST | /v1/user/payment/orders/{outTradeNo}/close | Close order |

:::tip
Use the `/channels` endpoint to get available payment methods before creating orders.
:::
