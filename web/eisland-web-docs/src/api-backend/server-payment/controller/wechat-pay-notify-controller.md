---
title: WeChat Pay Notify API
---

# WeChat Pay Notify API

:::info
WeChat Pay callback notification endpoint at `/v1/payment/wechat/notify`. This is a server-to-server callback from WeChat Pay.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /v1/payment/wechat/notify | Receive WeChat Pay payment notification |

:::warning
This endpoint is called by WeChat Pay servers, not by users. It does not require user authentication but validates the notification signature.
:::
