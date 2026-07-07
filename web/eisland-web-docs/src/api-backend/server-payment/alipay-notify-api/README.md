---
title: Alipay Notify API
---

# Alipay Notify API

:::info
Alipay payment callback notification endpoint at `/v1/payment/alipay/notify`. This is a server-to-server callback from Alipay.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /v1/payment/alipay/notify | Receive Alipay payment notification |

:::warning
This endpoint is called by Alipay servers, not by users. It does not require user authentication but validates the notification signature.
:::
